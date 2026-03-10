# Revenue Operations Analytics Platform

[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://api.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue?logo=google-gemini&logoColor=white)](https://ai.google.dev/)

A powerful, full-stack revenue operations platform that combines machine learning and generative AI to drive business growth. This platform transforms raw sales data into actionable intelligence, featuring AI-driven churn prediction, personalized sales pitch generation, and automated executive reporting.

---

## 🏗 Architecture

The platform follows a clean, decoupled architecture separating the presentation layer from the business logic and AI processing.

```mermaid
graph TD
    Client[React Frontend] -->|REST API| API[FastAPI Backend]
    API -->|ORM| DB[(PostgreSQL Database)]
    API -->|ML Logic| ML[Scikit-Learn / Churn Risk]
    API -->|GenAI| Gemini[Google Gemini 1.5 Flash]
    Gemini -->|Outreach & Reports| API
    Client -->|Auth| API
```

---

## 🚀 Key Features

### ✨ Modern UI & "Wow" Factor
- **Fluid Animations**: Staggered layouts and smooth transitions powered by **Framer Motion**.
- **Premium Aesthetic**: High-end, dark-mode-first design inspired by Mobbin and Sana AI.
- **Responsive Layouts**: Fully optimized for various screen sizes using Material UI.

### 🤖 AI-Powered Intelligence
- **AI Sales Pitch Generator**: Automatically generates highly personalized retention emails and sales pitches based on a customer's specific transaction history and churn risk.
- **Executive PDF Reports**: Generates professional PDF reports with an **AI-authored Executive Summary** of platform performance.
- **Churn Prediction Clusters**: Uses K-Means machine learning to categorize customers into High, Medium, and Low risk buckets.

### 📊 Deep Analytics
- **Interactive Charts**: Responsive visualizations for revenue split, customer acquisition, and transaction trends.
- **Risk Scatter Plots**: Visualizes the relationship between customer recency and lifetime value.
- **Seamless Data Ingest**: Secure multi-user environment with CSV upload capabilities.

---

## 🛠 Tech Stack

| Area | Technology | Usage |
|------|------------|-------|
| **Frontend** | React 18, TypeScript | Core application logic |
| **Animations** | Framer Motion | Silky-smooth UI transitions |
| **Backend** | FastAPI | High-performance API framework |
| **Generative AI**| Google Gemini 1.5 Flash | Personalized outreach & reporting |
| **ML Engine** | Scikit-Learn | K-Means clustering for churn risk |
| **Database** | PostgreSQL + SQLModel | Data persistence and ORM |
| **PDF Engine** | fpdf2 | Server-side PDF generation |

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- **Gemini API Key** (Get one for free at [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Install
```bash
git clone https://github.com/Sahaj2310/Revenue-Operations-Analytics-Platform.git
cd Revenue-Operations-Analytics-Platform
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate # windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://user:password@localhost/revops
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the API:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📑 API Reference (New Endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/customers/{name}/generate-pitch` | Generates a Gemini-powered sales pitch |
| `GET` | `/reports/executive-summary` | Downloads a PDF report with AI summary |
| `GET` | `/analytics/advanced` | Detailed revenue metrics & category splits |

---

## 📄 License

MIT License - Created for modern Sales & RevOps teams.
