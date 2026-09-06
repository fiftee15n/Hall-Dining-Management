# Hall Dining Management (HDM) - FastAPI Backend

A modern, fast, and fully relational backend API for the **Hall Dining Management System**, built with **FastAPI**, **SQLAlchemy 2.0**, **Pydantic v2**, and **JWT Authentication**.

---

## Features

- **Authentication & RBAC**: JWT Bearer authentication supporting roles (`Admin`, `Authority`, `Management Team`).
- **Student Database**: Full student registry, search & filter by room/block/batch, and bulk CSV upload.
- **Dynamic Management Periods**: Configure pricing (lunch, dinner, feast), booking duration rules, and period handover.
- **Meal Booking Engine**: Automatic tallying of lunch/dinner counts, total cost, on-spot dues vs partial vs overpayment change calculation.
- **Attendance & Dining Counter**: Live token check, mark meal taken, quick-take unbooked meal, and on-spot cash collection.
- **Guest Meal Ledger**: Record guest meals with host students, mark paid or due.
- **Grand Feast Management**: Create feast events, register students/guests, and assign unique tokens.
- **Expense & Market Tracking**: Itemized expenses by category (Grocery, Meat, Fish, Utilities, etc.) with automatic ledger outflow logging.
- **Double-Entry Financial Summary**: Live tracking of Opening Balance + Total Collections - Total Expenses - Settled Refunds = Current Balance.
- **Audit Logging**: Full audit trail recording all administrative and financial actions.
- **Dual Database Support**: SQLite (zero-config local development) and PostgreSQL (production).

---

## Getting Started

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.13)
- pip / virtualenv

### 2. Setup Virtual Environment & Install Dependencies

```bash
cd hdm-backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate

# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Configuration (`.env`)

Copy `.env.example` to `.env` (already pre-configured for local development):

```ini
PROJECT_NAME="Hall Dining Management API"
VERSION="1.0.0"
API_V1_STR="/api/v1"
DATABASE_URL="sqlite:///./data/hdm.db"
SECRET_KEY="supersecret_hall_dining_management_jwt_secret_key_change_in_production"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,*"
```

### 4. Run Database Seeding

Populate the database with initial users, management period #01, settings, and students from CSV:

```bash
python -m app.seed.seed_data
```

Default Login Credentials:
- **Admin**: `admin.hdm@gmail.com` / `Tamal12345@@`
- **Authority**: `authority.hdm@gmail.com` / `Authority@@`
- **Management Team**: `management.hdm@gmail.com` / `Management@@`

### 5. Start the Server

```bash
python run.py
```
Or with uvicorn:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Docs (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Running Tests

```bash
pytest
```

---

## API Endpoints Overview

| Area | Method | Path | Summary |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/v1/auth/login` | Login and obtain JWT token |
| | GET | `/api/v1/auth/me` | Current authenticated user profile |
| **Dashboard** | GET | `/api/v1/dashboard/stats` | Live summary stats |
| **Students** | GET | `/api/v1/students` | List students with search/filters |
| | POST | `/api/v1/students` | Add single student |
| | POST | `/api/v1/students/import-csv` | Bulk import students from CSV |
| | GET / PUT / DELETE | `/api/v1/students/{id}` | Student profile & management |
| **Periods** | GET / POST | `/api/v1/periods` | List or create management periods |
| | PUT | `/api/v1/periods/{id}` | Update period prices & configuration |
| | POST | `/api/v1/periods/{id}/activate` | Switch active management period |
| **Bookings** | GET / POST | `/api/v1/bookings` | List or create meal bookings |
| | DELETE | `/api/v1/bookings/{id}` | Cancel booking |
| **Attendance** | GET | `/api/v1/attendance` | List meal attendance for dates |
| | POST | `/api/v1/attendance/{id}/mark` | Mark attendance taken / collect dues |
| | POST | `/api/v1/attendance/quick-take` | Instant token & meal issue |
| **Guest Meals** | GET / POST | `/api/v1/guest-meals` | List or add guest meals |
| | POST | `/api/v1/guest-meals/{id}/pay` | Clear due on guest meal |
| **Feasts** | GET / POST | `/api/v1/feasts` | List or create feast events |
| | POST | `/api/v1/feasts/{id}/register` | Register student / guest for feast |
| **Expenses** | GET / POST | `/api/v1/expenses` | List or record operational expenses |
| | PUT / DELETE | `/api/v1/expenses/{id}` | Edit or delete expense |
| **Finance** | GET | `/api/v1/finance/transactions` | Payment transaction ledger |
| | POST | `/api/v1/finance/payments` | Record student manual due payment |
| | GET | `/api/v1/finance/receivables` | List student change receivables |
| | POST | `/api/v1/finance/receivables/{id}/settle` | Settle cash refund to student |
| **Audit** | GET | `/api/v1/audit-logs` | View administrative audit trail |
| **Settings** | GET / PUT | `/api/v1/settings` | Dining hall timings & settings |
| **Reports** | GET | `/api/v1/reports/financial-summary` | Category and payment breakdown |
| | GET | `/api/v1/reports/export-csv/{type}` | Download CSV reports |
