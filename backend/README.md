# Backend — FastAPI & AI Services

This directory contains the full Python backend built with **FastAPI**, including the REST API, Machine Learning models, Google Gemini AI integration, and PDF report generation.

---

## 📁 File Reference

| File | Purpose |
|------|---------|
| `main.py` | All FastAPI routes (stats, customers, reports, auth, upload) |
| `models.py` | SQLModel database schemas — `User` and `RevenueData` |
| `auth.py` | JWT token creation/verification + Argon2 password hashing |
| `database.py` | PostgreSQL connection setup and session factory |
| `ml_logic.py` | Churn risk (K-Means RFM) + revenue forecasting (Polynomial Regression) |
| `ai_service.py` | Google Gemini 2.5 Flash integration for pitch + PDF summary generation |
| `report_service.py` | PDF layout and generation using `fpdf2` |
| `requirements.txt` | All Python package dependencies |

---

## ⚙️ Setup

### 1. Create & activate a virtual environment
```bash
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in this directory:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/revops_db
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Never commit `.env` to version control.** It is listed in `.gitignore`.

### 4. Start the server
```bash
uvicorn main:app --reload
```

- API Base: `http://localhost:8000`
- Interactive Docs: `http://localhost:8000/docs`

---

## 🤖 AI Integration Notes

The AI features use the `google-genai` SDK (the new official SDK).

### Available Endpoints
- `POST /customers/{name}/generate-pitch` — generates a personalized outreach email using the customer's revenue, transaction history, and churn risk
- `GET /reports/executive-summary?time_range=30d` — generates + returns a downloadable PDF with Gemini-authored executive summary

### Model Used
`models/gemini-2.5-flash` — fast, high-quality, supports large context windows.

### Supported Time Ranges (for reports)
| Value | Description |
|-------|-------------|
| `7d` | Last 7 Days |
| `30d` | Last 30 Days (default) |
| `90d` | Last Quarter |
| `12m` | Last 12 Months |

---

## 🧠 ML Logic

### Churn Risk (`ml_logic.predict_churn_risk`)
1. Computes **RFM** metrics (Recency, Frequency, Monetary) per customer.
2. For ≥5 customers: applies **K-Means clustering** (k=3) and maps clusters to High / Medium / Low Risk by average recency.
3. For <5 customers: uses rule-based thresholds (>90 days = High, >30 days = Medium, else Low).

### Revenue Forecasting (`ml_logic.train_and_predict`)
1. Aggregates revenue into monthly buckets.
2. Fits a **Polynomial Regression (degree 2)** model.
3. Predicts the next 3 months.

---

## 🗃️ Database Schema

### `User`
| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer (PK) | Auto-increment |
| `username` | String | Unique |
| `email` | String | Unique |
| `hashed_password` | String | Argon2 hash |

### `RevenueData`
| Column | Type | Notes |
|--------|------|-------|
| `id` | Integer (PK) | Auto-increment |
| `date` | Date | Transaction date |
| `amount` | Float | Transaction value |
| `customer_name` | String | Customer identifier |
| `category` | String | Product/service category |
| `user_id` | Integer (FK) | Links to `User.id` |
