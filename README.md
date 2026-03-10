# 🚀 Revenue Operations Analytics Platform

[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-blue?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A full-stack **Revenue Operations Intelligence Platform** that combines Machine Learning, Generative AI, and modern web design to help sales and customer success teams make smarter, faster decisions.

---

## 📸 Preview

| Dashboard | Analytics | AI Pitch Generator |
|:---------:|:---------:|:-----------------:|
| Live KPIs, Revenue Sparkline | Category Splits + Churn Scatter | Gemini-powered outreach emails |

---

## ✨ Feature Highlights

### 🧠 AI & Machine Learning
| Feature | Description |
|---------|-------------|
| **AI Churn Prediction** | K-Means clustering on RFM data (Recency, Frequency, Monetary) categorizes every customer as High / Medium / Low risk automatically. |
| **AI Sales Pitch Generator** | Click a customer profile and generate a fully personalized sales or retention email in seconds, powered by **Google Gemini 2.5 Flash**. |
| **Executive PDF Reports** | Download a beautifully structured PDF report with live metrics and a **Gemini-authored 3-sentence Executive Summary** for any time period. |
| **Revenue Forecasting** | Polynomial regression model (degree 2) predicts the next 3–6 months of revenue from historical data. |

### 📊 Analytics & Dashboard
| Feature | Description |
|---------|-------------|
| **Key Metrics** | Real-time MRR, ARPU, Active Customers, and Growth Rate. |
| **Revenue Trend** | Sparkline-style interactive charts showing revenue over time. |
| **Category Breakdown** | Pie/donut chart split of revenue by product category. |
| **Churn Risk Scatter Plot** | XY scatterplot mapping Days-Since-Purchase vs Revenue for every customer, color-coded by risk level. |
| **Transaction Log** | Paginated, searchable table of all recent transactions. |

### 🎨 UI & User Experience
| Feature | Description |
|---------|-------------|
| **Framer Motion Animations** | Staggered fade-in + slide-up animations on every page and component. |
| **Premium Dark Theme** | Deep dark-mode aesthetic inspired by Mobbin and Sana AI. |
| **Customer Drawer** | Right-sliding detail panel with full transaction history and AI assistant. |
| **Responsive Design** | Fully functional on desktop and large tablets. |

### 🔐 Security & Multi-User
| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure JSON Web Token auth. Tokens expire automatically. |
| **Per-User Data Isolation** | All data (customers, revenue, transactions) is scoped to the logged-in user. |
| **Secure Password Hashing** | Passwords stored using Argon2 hashing via Passlib. |

---

## 🏗 System Architecture

```mermaid
graph TD
    A[React Frontend<br/>TypeScript + MUI + Framer Motion] -->|REST API / JWT| B[FastAPI Backend<br/>Python 3.9+]
    B -->|SQLModel ORM| C[(PostgreSQL<br/>Database)]
    B -->|RFM + K-Means| D[ML Engine<br/>Scikit-Learn]
    B -->|Prompt Engineering| E[Google Gemini 2.5 Flash<br/>Generative AI]
    B -->|fpdf2| F[PDF Engine<br/>Executive Reports]
    E --> B
    D --> B
```

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.100+ | High-performance REST API |
| **SQLModel** | 0.0.16+ | ORM + schema definitions |
| **PostgreSQL** | 14+ | Relational database |
| **Pandas** | 2.0+ | Data manipulation & aggregation |
| **Scikit-Learn** | 1.3+ | K-Means clustering, regression |
| **Google GenAI** | 1.66+ | Gemini AI integration |
| **fpdf2** | 2.7+ | PDF generation |
| **python-jose** | 3.3+ | JWT tokens |
| **Passlib (Argon2)** | 1.7+ | Password hashing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18 | UI library |
| **TypeScript** | 5.0+ | Type-safe JavaScript |
| **Material UI** | 5.0+ | Component library & theming |
| **Framer Motion** | 11+ | Animations & transitions |
| **Recharts** | 2.0+ | Interactive data charts |
| **Axios** | 1.0+ | HTTP requests |
| **Vite** | 5.0+ | Build tool |

---

## 📂 Project Structure

```
Revenue-Operations-Analytics-Platform/
│
├── 📁 backend/                    # FastAPI Python Application
│   ├── main.py                   # Entry point & all API routes
│   ├── models.py                 # SQLModel DB schemas (User, RevenueData)
│   ├── auth.py                   # JWT & password hashing utilities
│   ├── database.py               # DB connection & session factory
│   ├── ml_logic.py               # Churn risk prediction + revenue forecasting
│   ├── ai_service.py             # Google Gemini AI integration
│   ├── report_service.py         # PDF report generation (fpdf2)
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # 🔒 Environment variables (NOT committed)
│   └── README.md                 # Backend-specific docs
│
├── 📁 frontend/                   # React TypeScript Application
│   ├── src/
│   │   ├── pages/                # Top-level page components
│   │   │   ├── Dashboard.tsx     # Main dashboard with KPIs
│   │   │   ├── Analytics.tsx     # Deep analytics + PDF download
│   │   │   ├── Customers.tsx     # Customer list + AI drawer
│   │   │   ├── Login.tsx         # Authentication page
│   │   │   └── Register.tsx      # Registration page
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   │   ├── CustomerDrawer.tsx# Customer detail + AI pitch
│   │   │   ├── CustomerTable.tsx # Animated transaction table
│   │   │   ├── RevenueChart.tsx  # Revenue line chart
│   │   │   ├── CategoryChart.tsx # Revenue category pie chart
│   │   │   ├── StatCard.tsx      # KPI metric card
│   │   │   └── MetricStrip.tsx   # Dashboard metric strip
│   │   ├── context/              # React context (auth state)
│   │   ├── api.ts                # All Axios API calls
│   │   ├── types.ts              # TypeScript type definitions
│   │   └── theme.ts              # MUI dark theme config
│   ├── package.json
│   └── README.md                 # Frontend-specific docs
│
├── sample_data.csv               # Sample data for testing
└── README.md                     # ← You are here
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **Python** 3.9 or higher
- **PostgreSQL** 14 or higher (running locally or on a cloud service)
- **Google Gemini API Key** — get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Sahaj2310/Revenue-Operations-Analytics-Platform.git
cd Revenue-Operations-Analytics-Platform
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install all Python dependencies
pip install -r requirements.txt
```

**Create your `.env` file** inside the `backend/` directory:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/revops_db

# JWT Configuration
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

**Start the backend server:**

```bash
uvicorn main:app --reload
```

✅ Backend will be live at `http://localhost:8000`  
📚 Interactive API docs at `http://localhost:8000/docs`

---

### 3. Frontend Setup

Open a **new terminal** in the project root:

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

✅ Frontend will be live at `http://localhost:5173`

---

### 4. First Run

1. Open `http://localhost:5173` in your browser.
2. Click **Register** to create a new account.
3. Log in, then go to **Dashboard** and click **Upload CSV**.
4. Upload the included `sample_data.csv` file — data will populate immediately.
5. Navigate to **Customers** and click any row to open the AI Pitch Generator.
6. Go to **Analytics** and click **Download Report (.pdf)** to get your AI Executive Report.

---

## 📑 Full API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create a new account |
| `POST` | `/token` | ❌ | Login and receive JWT token |
| `GET` | `/stats` | ✅ | Dashboard KPIs (MRR, ARPU, etc.) |
| `GET` | `/analytics/advanced` | ✅ | Full analytics with time range filter |
| `GET` | `/customers` | ✅ | All customers with churn risk scores |
| `GET` | `/customers/{name}` | ✅ | Transactions for a specific customer |
| `POST` | `/customers/{name}/generate-pitch` | ✅ | AI-generated sales pitch for customer |
| `GET` | `/forecast` | ✅ | ML revenue forecast (next 3 months) |
| `POST` | `/upload` | ✅ | Bulk CSV data upload |
| `DELETE` | `/data` | ✅ | Clear all data for current user |
| `GET` | `/reports/executive-summary` | ✅ | Download AI-powered PDF report |

> **Auth** column: ✅ requires `Authorization: Bearer <token>` header.

---

## 📊 CSV Data Format

When uploading your own data, the CSV file must have the following columns:

| Column | Type | Example |
|--------|------|---------|
| `date` | Date (YYYY-MM-DD) | `2025-03-15` |
| `amount` | Number | `1500.00` |
| `customer_name` | String | `Acme Corp` |
| `category` | String | `Subscription` |

A ready-to-use `sample_data.csv` is included in the root directory.

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with a descriptive message
4. Open a Pull Request

---

