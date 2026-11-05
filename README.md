# PACKORA — Custom Packaging Platform

Full-stack custom packaging business: React storefront + Django REST API + PostgreSQL.

```
packora/
├── backend/    Django 6 + DRF + SimpleJWT + PostgreSQL
└── frontend/   React 19 + Vite + Tailwind CSS v4
```

## Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, Tailwind CSS v4, React Router, Axios, Lucide |
| Backend | Django 6, Django REST Framework, SimpleJWT, django-environ, django-filter, WhiteNoise |
| Database | PostgreSQL 15 |
| Auth | JWT access (1h) + refresh (7d) tokens, role-based (admin/customer/supplier) |

## Local setup

### Prerequisites
- Python 3.12+, Node 20+, PostgreSQL 15 (`brew install postgresql@15 && brew services start postgresql@15`)

### Backend
```bash
cd packora/backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # fill in SECRET_KEY + DATABASE_URL
createdb packora_db               # or via your Postgres provider
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver        # http://localhost:8000 · admin at /admin/
```

### Frontend
```bash
cd packora/frontend
npm install
cp .env.example .env 2>/dev/null || echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev                       # http://localhost:5173
```

## Tests

```bash
cd packora/backend
python manage.py test             # 23 tests: auth, JWT, permissions, uploads, orders
npm --prefix ../frontend run build
```

Covers: registration/login/logout+blacklist, JWT refresh, password hashing,
role permissions (admin/customer/supplier), enquiry & order data isolation,
file-upload validation (type + 10MB size), MOQ enforcement, order status
transitions and terminal-state lock.

## API overview

| Endpoint | Access |
|---|---|
| `POST /api/auth/register|login|refresh|logout` | public / token |
| `GET/PATCH /api/auth/me/`, `/api/auth/profile/` | authenticated |
| `GET /api/categories/`, `GET /api/products/` | public read; admin write |
| `POST /api/products/{slug}/images/` | admin (multipart) |
| `POST /api/enquiries/` | public (guests OK, files supported) |
| `GET /api/enquiries/` | own enquiries (customers) / all (admin) |
| `GET/POST /api/orders/` | customers: own orders; admin: all |
| `POST /api/orders/{id}/update-status/` | admin only |
| `POST /api/orders/{id}/assign-supplier/` | admin only |
| `GET/POST /api/quotations/` | admin write; customers read own |
| `/api/suppliers/`, `/api/dashboard/stats/` | **admin only** (costs/margins never exposed) |

## Deployment

### Backend → Render (or Railway/Fly)
1. Push repo to GitHub.
2. Render → New Web Service → connect repo → root dir `packora/backend`.
3. Build: `pip install -r requirements.txt` · Start: `gunicorn config.wsgi`
   (add `gunicorn` to requirements.txt for production).
4. Add a Render **PostgreSQL** instance; set env vars:
   `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL`, `ALLOWED_HOSTS=<your-service>.onrender.com`,
   `CORS_ALLOWED_ORIGINS=https://<your-app>.vercel.app`
5. `python manage.py migrate && python manage.py collectstatic` runs via `render.yaml`/release command.

### Frontend → Vercel
1. Import repo → root directory `packora/frontend`.
2. Framework: Vite (auto-detected). Build: `npm run build`, output `dist`.
3. Env var: `VITE_API_URL=https://<your-backend>.onrender.com/api`

### Media files
Local `media/` is ephemeral on Render — for production use **Cloudinary**,
**AWS S3**, or Render Disks. Set `DEFAULT_FILE_STORAGE`/`STORAGES` accordingly.

## Security notes
- `DEBUG=False` activates HTTPS redirect, secure cookies, HSTS.
- `.env` is gitignored; `.env.example` documents required vars.
- Supplier costs (`cost_notes`, `lead_time_days`) are admin-gated end to end.
- Uploads validated by extension + Pillow image check + 10MB cap.
