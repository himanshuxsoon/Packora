import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import EnquiryPage from './pages/EnquiryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import OrdersPage from './pages/OrdersPage'
import DashboardPage from './pages/DashboardPage'
import PlaceholderPage from './pages/PlaceholderPage'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import ProductsAdmin from './pages/admin/ProductsAdmin'
import CategoriesAdmin from './pages/admin/CategoriesAdmin'
import EnquiriesAdmin from './pages/admin/EnquiriesAdmin'
import QuotationsAdmin from './pages/admin/QuotationsAdmin'
import OrdersAdmin from './pages/admin/OrdersAdmin'
import SuppliersAdmin from './pages/admin/SuppliersAdmin'

function ProtectedRoute({ children, admin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (admin && !isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="enquire" element={<EnquiryPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<PlaceholderPage title="Page not found" />} />
          </Route>

          {/* Admin console — own layout, no storefront chrome */}
          <Route
            path="admin"
            element={
              <ProtectedRoute admin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="enquiries" element={<EnquiriesAdmin />} />
            <Route path="quotations" element={<QuotationsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="suppliers" element={<SuppliersAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
