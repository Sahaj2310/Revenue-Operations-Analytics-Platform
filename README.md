# Revenue Operations Analytics Platform

A comprehensive full-stack application designed to provide deep insights into revenue operations. This platform combines a robust FastAPI backend with a modern React frontend to deliver real-time analytics, customer churn prediction, and revenue forecasting.

## 🚀 Key Features

*   **Interactive Dashboard**: Visualize vital metrics like MRR (Monthly Recurring Revenue), ARPU (Average Revenue Per User), and growth rates.
*   **Data Management**: Seamlessly upload and process sales data via CSV.
*   **Advanced Analytics**:
    *   **Churn Prediction**: AI-driven customer risk scoring using K-Means clustering.
    *   **Revenue Forecasting**: Predictive modeling for future revenue trends.
*   **Customer Insights**: Detailed views of customer activity and retention risks.
*   **Modern UI**: Responsive and accessible design built with Material UI.

## 🛠 Tech Stack

### Frontend
*   **Framework**: React 18 + Vite
*   **Language**: TypeScript
*   **Components**: Material UI (MUI)
*   **Visualization**: Recharts
*   **State Management**: Context API

### Backend
*   **Framework**: FastAPI
*   **Language**: Python 3.9+
*   **Database**: SQLite (SQLModel ORM)
*   **Machine Learning**: Scikit-Learn (K-Means, Linear Regression)
*   **Data Processing**: Pandas

## 🏁 Quick Start

### Prerequisites
*   Node.js (v18+)
*   Python (v3.9+)

### 1. Backend Setup
 Navigate to the backend directory and start the server:

```bash
cd backend

# Create virtual environment
python -m venv venv
# Activate: .\venv\Scripts\activate (Windows) or source venv/bin/activate (Mac/Linux)

# Install dependencies
pip install -r requirements.txt

# Start Server
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.
Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the client:

```bash
cd frontend

# Install dependencies
npm install

# Start Dev Server
npm run dev
```
The application will run at `http://localhost:5173`.

## 📂 Project Structure

*   **`/frontend`**: React application source code, components, and pages.
*   **`/backend`**: FastAPI application, ML models, and database logic.
