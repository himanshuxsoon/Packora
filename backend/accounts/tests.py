"""PACKORA API test suite — auth, permissions, uploads, orders."""
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import CustomerProfile, User
from enquiries.models import Enquiry
from orders.models import Order
from products.models import Category, Product
from suppliers.models import Supplier


def make_user(username='customer1', role='customer', password='Test@1234'):
    return User.objects.create_user(
        username=username, email=f'{username}@test.com',
        password=password, role=role,
    )


def auth_client(user):
    client = APIClient()
    resp = client.post('/api/auth/login/', {
        'username': user.username, 'password': 'Test@1234',
    })
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    return client


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = make_user()

    def test_register_creates_customer_with_profile(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'newuser', 'email': 'new@test.com',
            'password': 'Str0ng!Pass', 'password_confirm': 'Str0ng!Pass',
            'profile': {'company_name': 'NewCo'},
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['user']['role'], 'customer')
        self.assertIn('access', resp.data['tokens'])
        self.assertTrue(CustomerProfile.objects.filter(
            user__username='newuser', company_name='NewCo').exists())

    def test_register_rejects_mismatched_passwords(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'x', 'email': 'x@t.com',
            'password': 'a', 'password_confirm': 'b',
        })
        self.assertEqual(resp.status_code, 400)

    def test_login_returns_jwt_pair(self):
        resp = self.client.post('/api/auth/login/', {
            'username': 'customer1', 'password': 'Test@1234',
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

    def test_me_requires_auth(self):
        self.assertIn(
            self.client.get('/api/auth/me/').status_code, (401, 403))

    def test_me_returns_own_data(self):
        client = auth_client(self.user)
        resp = client.get('/api/auth/me/')
        self.assertEqual(resp.data['username'], 'customer1')

    def test_logout_blacklists_refresh(self):
        resp = self.client.post('/api/auth/login/', {
            'username': 'customer1', 'password': 'Test@1234',
        })
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
        out = client.post('/api/auth/logout/',
                          {'refresh': resp.data['refresh']})
        self.assertEqual(out.status_code, 200)
        reuse = self.client.post('/api/auth/refresh/',
                                 {'refresh': resp.data['refresh']})
        self.assertEqual(reuse.status_code, 401)

    def test_password_is_hashed(self):
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.password, 'Test@1234')
        self.assertTrue(self.user.password.startswith('pbkdf2_'))


class PermissionTests(TestCase):
    def setUp(self):
        self.customer = make_user('cust')
        self.other = make_user('other')
        self.admin = make_user('admin', role='admin')
        self.supplier_user = make_user('supp', role='supplier')
        self.cat = Category.objects.create(name='Boxes')
        self.product = Product.objects.create(
            name='Box', category=self.cat, price='10.00')
        self.cust_client = auth_client(self.customer)
        self.other_client = auth_client(self.other)
        self.admin_client = auth_client(self.admin)
        self.supp_client = auth_client(self.supplier_user)

    def test_customer_cannot_create_product(self):
        resp = self.cust_client.post('/api/products/', {
            'name': 'X', 'category': self.cat.id, 'price': '1.00'})
        self.assertEqual(resp.status_code, 403)

    def test_admin_can_create_product(self):
        resp = self.admin_client.post('/api/products/', {
            'name': 'X', 'category': self.cat.id, 'price': '1.00'})
        self.assertEqual(resp.status_code, 201)

    def test_suppliers_admin_only(self):
        self.assertEqual(self.cust_client.get('/api/suppliers/').status_code, 403)
        self.assertEqual(self.supp_client.get('/api/suppliers/').status_code, 403)
        self.assertEqual(self.admin_client.get('/api/suppliers/').status_code, 200)

    def test_dashboard_stats_admin_only(self):
        self.assertEqual(self.cust_client.get('/api/dashboard/stats/').status_code, 403)
        self.assertEqual(self.admin_client.get('/api/dashboard/stats/').status_code, 200)

    def test_enquiry_isolation(self):
        self.cust_client.post('/api/enquiries/', {
            'name': 'C', 'email': 'c@t.com', 'subject': 'S', 'message': 'M'})
        own = self.cust_client.get('/api/enquiries/')
        other = self.other_client.get('/api/enquiries/')
        self.assertEqual(own.data['count'], 1)
        self.assertEqual(other.data['count'], 0)

    def test_guest_cannot_list_enquiries(self):
        resp = APIClient().get('/api/enquiries/')
        self.assertEqual(resp.data['count'], 0)

    def test_guest_can_submit_enquiry(self):
        resp = APIClient().post('/api/enquiries/', {
            'name': 'G', 'email': 'g@t.com', 'subject': 'S', 'message': 'M'})
        self.assertEqual(resp.status_code, 201)
        self.assertRegex(resp.data['reference'], r'^ENQ-\d{6}-[0-9A-F]{6}$')

    def test_order_isolation(self):
        order = Order.objects.create(
            customer=self.customer,
            shipping_address='a', shipping_city='c',
            shipping_postal_code='1')
        resp = self.other_client.get(f'/api/orders/{order.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_customer_cannot_update_order_status(self):
        order = Order.objects.create(
            customer=self.customer,
            shipping_address='a', shipping_city='c',
            shipping_postal_code='1')
        resp = self.cust_client.post(
            f'/api/orders/{order.id}/update-status/',
            {'status': 'shipped'})
        self.assertEqual(resp.status_code, 403)


class UploadSecurityTests(TestCase):
    def setUp(self):
        self.admin = make_user('admin', role='admin')
        self.client = auth_client(self.admin)
        self.cat = Category.objects.create(name='Boxes')
        self.product = Product.objects.create(
            name='Box', category=self.cat, price='10.00')

    def _png(self, size_kb=1):
        # minimal valid PNG header + padding (Pillow not required for ext check)
        return SimpleUploadedFile(
            'x.png', b'\x89PNG\r\n\x1a\n' + b'0' * (size_kb * 1024),
            content_type='image/png')

    def test_rejects_disallowed_extension(self):
        f = SimpleUploadedFile('evil.php', b'<?php echo 1;',
                               content_type='application/x-php')
        resp = self.client.post(
            f'/api/products/{self.product.slug}/images/',
            {'image': f}, format='multipart')
        self.assertEqual(resp.status_code, 400)

    def test_rejects_oversized_file(self):
        big = SimpleUploadedFile('big.png', b'\x89PNG\r\n\x1a\n' + b'0' * (11 * 1024 * 1024),
                                 content_type='image/png')
        resp = self.client.post(
            f'/api/products/{self.product.slug}/images/',
            {'image': big}, format='multipart')
        self.assertEqual(resp.status_code, 400)

    def test_guest_cannot_upload(self):
        resp = APIClient().post(
            f'/api/products/{self.product.slug}/images/',
            {'image': self._png()}, format='multipart')
        self.assertIn(resp.status_code, (401, 403))


class OrderFlowTests(TestCase):
    def setUp(self):
        self.customer = make_user('buyer')
        self.admin = make_user('admin', role='admin')
        self.cat = Category.objects.create(name='Boxes')
        self.product = Product.objects.create(
            name='Box', category=self.cat, price='10.00',
            min_order_quantity=10)
        self.client = auth_client(self.customer)
        self.admin_client = auth_client(self.admin)

    def test_order_uses_server_side_pricing(self):
        resp = self.client.post('/api/orders/', {
            'shipping_address': 'a', 'shipping_city': 'c',
            'shipping_postal_code': '1',
            'items': [{'product': self.product.slug, 'quantity': 10}],
        }, format='json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data['total'], '100.00')
        self.assertEqual(resp.data['status'], 'pending')
        self.assertEqual(len(resp.data['status_history']), 1)

    def test_moq_enforced(self):
        resp = self.client.post('/api/orders/', {
            'shipping_address': 'a', 'shipping_city': 'c',
            'shipping_postal_code': '1',
            'items': [{'product': self.product.slug, 'quantity': 5}],
        }, format='json')
        self.assertEqual(resp.status_code, 400)

    def test_status_transition_and_history(self):
        order = Order.objects.create(
            customer=self.customer, shipping_address='a',
            shipping_city='c', shipping_postal_code='1')
        resp = self.admin_client.post(
            f'/api/orders/{order.id}/update-status/',
            {'status': 'confirmed', 'note': 'ok'})
        self.assertEqual(resp.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, 'confirmed')
        self.assertEqual(order.status_history.count(), 1)

    def test_terminal_state_locked(self):
        order = Order.objects.create(
            customer=self.customer, shipping_address='a',
            shipping_city='c', shipping_postal_code='1',
            status=Order.Status.DELIVERED)
        resp = self.admin_client.post(
            f'/api/orders/{order.id}/update-status/',
            {'status': 'pending'})
        self.assertEqual(resp.status_code, 400)
