from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, delete
from typing import List
import pandas as pd
import io
from datetime import timedelta
from database import create_db_and_tables, get_session, engine
from models import RevenueData, User, UserCreate
from ml_logic import train_and_predict, predict_churn_risk
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES, 
    create_access_token, 
    get_password_hash, 
    verify_password,
    get_current_user
)

app = FastAPI()

# CORS Setup
origins = [
    "http://localhost:5173", # Vite Frontend
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# --- Authentication Endpoints ---

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, session: Session = Depends(get_session)):
    # Check if user exists
    statement = select(User).where((User.username == user_in.username) | (User.email == user_in.email))
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    user = User(username=user_in.username, email=user_in.email, hashed_password=hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message": "User created successfully"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/upload")
def upload_csv(
    file: UploadFile = File(...), 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a CSV file.")
    
    try:
        contents = file.file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Data Cleaning
        df = df.fillna(0) # Fill missing values with 0
        
        # 1. Validate Columns (Case Insensitive)
        df.columns = [c.lower() for c in df.columns]
        required_columns = ['date', 'amount', 'customer_name', 'category']
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
             raise HTTPException(status_code=400, detail=f"Missing columns: {', '.join(missing_cols)}")

        # 2. Validate Data Types & Formats
        # Date Parsing (Handle various formats)
        try:
            df['date'] = pd.to_datetime(df['date'], errors='raise')
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date format in 'date' column. Use YYYY-MM-DD or MM/DD/YYYY.")

        # Numeric Validation
        try:
            df['amount'] = pd.to_numeric(df['amount'], errors='raise')
            if (df['amount'] < 0).any():
                raise HTTPException(status_code=400, detail="Amount cannot be negative.")
        except Exception:
             raise HTTPException(status_code=400, detail="Invalid number format in 'amount' column.")

        # Bulk Insert
        for _, row in df.iterrows():
            revenue_entry = RevenueData(
                date=row['date'],
                amount=float(row['amount']),
                customer_name=str(row['customer_name']),
                category=str(row['category'])
            )
            session.add(revenue_entry)
        
        session.commit()
        return {"message": "Data uploaded and processed successfully", "rows_processed": len(df)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats(session: Session = Depends(get_session)):
    statement = select(RevenueData)
    results = session.exec(statement).all()
    
    if not results:
        return {"total_revenue": 0, "monthly_revenue": [], "top_customers": []}
    
    # Convert to DataFrame for easier processing
    data = []
    for row in results:
        data.append(row.dict())
    df = pd.DataFrame(data)
    
    # Total Revenue
    total_revenue = float(df['amount'].sum())
    
    # Monthly Revenue
    df['date'] = pd.to_datetime(df['date'])
    monthly_revenue = df.resample('ME', on='date')['amount'].sum().reset_index()
    monthly_revenue_list = []
    for _, row in monthly_revenue.iterrows():
        monthly_revenue_list.append({
            "month": row['date'].strftime('%Y-%m'),
            "revenue": float(row['amount'])
        })
        
    # Top Customers
    top_customers = df.groupby('customer_name')['amount'].sum().nlargest(3).reset_index()
    top_customers_list = []
    for _, row in top_customers.iterrows():
        top_customers_list.append({
            "customer_name": row['customer_name'],
            "revenue": float(row['amount'])
        })
        
    return {
        "total_revenue": total_revenue,
        "monthly_revenue": monthly_revenue_list,
        "top_customers": top_customers_list
    }

@app.get("/analytics/advanced")
def get_advanced_analytics(time_range: str = "30d", session: Session = Depends(get_session)):
    statement = select(RevenueData)
    results = session.exec(statement).all()
    
    if not results:
        return {
            "mrr": 0, "active_customers": 0, "arpu": 0, "growth_rate": 0,
            "category_split": [], "recent_transactions": [], "sparkline": []
        }
    
    data = [row.dict() for row in results]
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    
    # Determine Date Range
    max_date = df['date'].max()
    if time_range == "7d":
        days = 7
    elif time_range == "90d":
        days = 90
    elif time_range == "12m":
        days = 365
    else:
        days = 30 # Default

    start_date = max_date - pd.Timedelta(days=days)
    
    # Filter Data for Current Period
    current_df = df[(df['date'] > start_date) & (df['date'] <= max_date)]
    
    # Filter Data for Previous Period (for Growth Rate)
    prev_start = start_date - pd.Timedelta(days=days)
    prev_df = df[(df['date'] > prev_start) & (df['date'] <= start_date)]
    
    # 1. Total Revenue in Range (acting as MRR/Revenue for the period)
    current_revenue = float(current_df['amount'].sum())
    prev_revenue = float(prev_df['amount'].sum())
    
    # Growth Rate
    growth_rate = 0.0
    if prev_revenue > 0:
        growth_rate = ((current_revenue - prev_revenue) / prev_revenue) * 100

    # 2. Active Customers
    active_customers = int(current_df['customer_name'].nunique())
    
    # 3. ARPU
    arpu = float(current_revenue / active_customers) if active_customers > 0 else 0
    
    # 4. Category Split (Entire dataset for context, or just current range? Let's use current range for accuracy)
    category_split = current_df.groupby('category')['amount'].sum().reset_index()
    category_list = [
        {"name": row['category'], "value": float(row['amount'])} 
        for _, row in category_split.iterrows()
    ]
    
    # 5. Recent Transactions
    recent_tx = df.sort_values(by='date', ascending=False).head(5)
    recent_list = [
        {
            "id": row['id'],
            "customer": row['customer_name'],
            "amount": float(row['amount']),
            "date": row['date'].strftime('%Y-%m-%d'),
            "category": row['category']
        }
        for _, row in recent_tx.iterrows()
    ]
    
    # 6. Sparkline Data (Daily aggregation for the selected range)
    # Resample to ensure all days are present, fill with 0
    sparkline_df = current_df.set_index('date').resample('D')['amount'].sum().reset_index()
    sparkline_list = [
        {"date": row['date'].strftime('%Y-%m-%d'), "value": float(row['amount'])}
        for _, row in sparkline_df.iterrows()
    ]

    return {
        "mrr": current_revenue, # Reusing MRR field for "Revenue in Period"
        "active_customers": active_customers,
        "arpu": arpu,
        "growth_rate": round(growth_rate, 2),
        "category_split": category_list,
        "recent_transactions": recent_list,
        "sparkline": sparkline_list
    }

@app.get("/forecast")
def get_forecast(session: Session = Depends(get_session)):
    statement = select(RevenueData)
    results = session.exec(statement).all()
    
    if not results:
         return {"historical": [], "forecast": []}
         
    # Convert to DataFrame
    data = []
    for row in results:
        data.append(row.dict())
    df = pd.DataFrame(data)
    
    forecast_results = train_and_predict(df)
    
    return {"forecast": forecast_results}

@app.delete("/data")
def clear_data(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = delete(RevenueData)
    session.exec(statement)
    session.commit()
    return {"message": "All data cleared successfully"}

from models import RevenueData
from ml_logic import train_and_predict, predict_churn_risk

# ... existing code ...

@app.get("/customers")
def get_customers(session: Session = Depends(get_session)):
    statement = select(RevenueData)
    results = session.exec(statement).all()
    
    if not results:
        return []
        
    data = [row.dict() for row in results]
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date']) # Ensure datetime type
    
    # AI Churn Risk Prediction
    try:
        print(f"DEBUG: Processing {len(df)} rows for AI.")
        churn_risks = predict_churn_risk(df)
        print(f"DEBUG: AI complete. Generated risks for {len(churn_risks)} customers.")
        if len(churn_risks) > 0:
            print(f"DEBUG: Sample risk: {list(churn_risks.items())[0]}")
    except Exception as e:
        print(f"ML Error: {e}")
        import traceback
        traceback.print_exc()
        churn_risks = {}
    
    # Aggregation
    customer_stats = df.groupby('customer_name').agg({
        'amount': 'sum',
        'date': 'max',
        'id': 'count'
    }).reset_index()
    
    customer_stats.columns = ['name', 'total_revenue', 'last_purchase', 'transactions']
    customer_stats = customer_stats.sort_values(by='total_revenue', ascending=False)
    
    customers_list = []
    
    # Cache current time for consistency
    now = pd.Timestamp.now()
    
    for i, row in customer_stats.iterrows():
        # Get Risk Data (Default to Unknown if missing)
        risk_data = churn_risks.get(row['name'], {"risk": "Unknown", "reason": "Insufficient Data"})
        
        # Calculate Recency
        recency = (now - row['last_purchase']).days
        
        customers_list.append({
            "id": i,
            "name": row['name'],
            "total_revenue": float(row['total_revenue']),
            "last_purchase": row['last_purchase'].strftime('%Y-%m-%d'),
            "transactions": int(row['transactions']),
            "recency": int(recency),
            "status": "Active" if recency <= 90 else "Inactive",
            "churn_risk": risk_data["risk"],
            "churn_risk_reason": risk_data["reason"]
        })
    
    return customers_list

@app.get("/customers/{customer_name}")
def get_customer_details(customer_name: str, session: Session = Depends(get_session)):
    statement = select(RevenueData).where(RevenueData.customer_name == customer_name).order_by(RevenueData.date.desc())
    results = session.exec(statement).all()
    
    if not results:
        return []
        
    transactions = [
        {
            "id": row.id,
            "date": row.date.strftime('%Y-%m-%d'),
            "amount": float(row.amount),
            "category": row.category
        }
        for row in results
    ]
    return transactions
