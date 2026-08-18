# Ledgerly – Django REST Backend

Backend for the Ledgerly Capital Control Platform described in the supplied specification.

## Stack
- Django
- Django REST Framework
- JWT authentication
- django-filter
- SQLite for local development
- CORS for React/Vite frontend

## Important implementation choice
The specification defines the balance formula but does not define investment/expense status values. This backend uses `active` and `inactive`; only `active` records are included in totals.

## Setup

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python seed_demo.py
python manage.py runserver
```

API base URL:
`http://127.0.0.1:8000/api/`

## Demo login
- Admin: `admin@example.com` / `admin123`
- Standard user (Kavya): `user@example.com` / `user123`
- Standard user (Ravi): `ravi@example.com` / `ravi12345`

## Authentication

POST `/api/auth/login/`

```json
{
  "identifier": "admin@example.com",
  "password": "admin123"
}
```

`identifier` accepts either the account's email address or its full name (used as a username).

Response contains `access`, `refresh`, and `user`.

Send the access token on protected requests:

`Authorization: Bearer <access_token>`

## Main endpoints

### Authentication
- POST `/api/auth/login/`
- POST `/api/auth/refresh/`
- GET `/api/auth/me/`

### Users – admin only
- GET `/api/users/`
- POST `/api/users/`
- GET `/api/users/{id}/`
- PUT/PATCH `/api/users/{id}/`
- DELETE `/api/users/{id}/`

Create user:
```json
{
  "full_name": "Kavya",
  "email": "user2@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "role": "standard_user",
  "status": "active"
}
```

### Investments
- GET `/api/investments/`
- GET `/api/investments/{id}/`
- POST `/api/investments/` – admin only
- PUT/PATCH `/api/investments/{id}/` – admin only
- DELETE `/api/investments/{id}/` – admin only
- GET `/api/investments/summary/`

Admin investment body:
```json
{
  "user": 2,
  "investor_source": "Company Capital",
  "amount": "50000.00",
  "investment_date": "2026-08-14",
  "description": "Initial capital",
  "status": "active"
}
```

Standard users can only read their own investments.

### Expenses
- GET `/api/expenses/`
- GET `/api/expenses/{id}/`
- POST `/api/expenses/` – admin or standard user
- PUT/PATCH `/api/expenses/{id}/` – admin only
- DELETE `/api/expenses/{id}/` – admin only
- GET `/api/expenses/summary/`

Standard user expense body does NOT contain `user`:
```json
{
  "category": "Travel",
  "description": "Business travel",
  "amount": "10000.00",
  "expense_date": "2026-08-14",
  "payment_method": "UPI",
  "status": "active"
}
```

The backend ignores any attempt to choose another user because the standard-user serializer automatically uses `request.user`.

### Dashboard
- GET `/api/dashboard/`

Admin response includes:
- total investment
- total expenses
- remaining balance
- total users

Standard user response contains only their own totals.

### Remaining balance
- GET `/api/balance/` – current user's balance for standard user, overall balance for admin
- GET `/api/balance/users/` – admin user-wise summaries
- GET `/api/balance/{user_id}/user/` – admin summary for one user

Balance is never stored in the database:

`remaining_balance = total_investment - total_expenses`

## Filtering/search/pagination

Investments:
- `?search=travel`
- `?user=2`
- `?status=active`
- `?investment_date=2026-08-14`
- `?page=2`
- `?page_size=20`

Expenses:
- `?search=travel`
- `?user=2`
- `?category=Travel`
- `?payment_method=UPI`
- `?status=active`
- `?expense_date=2026-08-14`
- `?page=2`

Users:
- `?search=Kavya`
- `?status=active`
- `?page=2`

## Security rules implemented

1. Standard users can never list another user's investments.
2. Standard users can never list another user's expenses.
3. Standard users cannot create investments.
4. Standard users cannot update/delete investments.
5. Standard users can create only their own expenses.
6. Standard users cannot update/delete expenses.
7. Standard users cannot access user management.
8. Admins can manage all standard users and all financial records.
9. Balance is calculated from database records and cannot be manually edited.

## React integration

For Vite:
- API: `http://127.0.0.1:8000/api/`
- Send JWT access token as `Authorization: Bearer <token>`.

Change `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, CORS, and database settings before production deployment.
