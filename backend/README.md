# Backend - Revenue Operations Analytics Platform

This directory contains the FastAPI backend for the Revenue Operations Analytics Platform. For a complete project overview, please refer to the [Root README](../README.md).

## ⚡ Quick Commands

### Setup Virtual Environment
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Mac/Linux
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Run Server
```bash
uvicorn main:app --reload
```
*   API: `http://localhost:8000`
*   Docs: `http://localhost:8000/docs`

## 🧠 ML & Data Logic
*   **`ml_logic.py`**: Contains K-Means clustering and regression models.
*   **`generate_data.py`**: Utilities for seeding the database with sample data.
