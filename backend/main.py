from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, delete
from typing import List, Optional
import pandas as pd
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from datetime import timedelta
from database import create_db_and_tables, get_session, engine
from models import RevenueData, User
from ml_logic import train_and_predict, predict_churn_risk, generate_ai_forecast
from ai_service import generate_personalized_pitch, generate_executive_summary, translate_query_to_sql
from report_service import generate_pdf_report
from fastapi.responses import Response
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES, 
    create_access_token, 
    get_password_hash, 
    verify_password,
    get_current_user,
    verify_google_token
)
from pydantic import BaseModel

class GoogleAuthRequest(BaseModel):
    token: str


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
def register(user: User, session: Session = Depends(get_session)):
    # Check if user exists by username
    statement = select(User).where(User.username == user.username)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    # Check if user exists by email
    statement_email = select(User).where(User.email == user.email)
    existing_email = session.exec(statement_email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user.hashed_password = get_password_hash(user.hashed_password)
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

@app.post("/auth/google")
def google_auth(request: GoogleAuthRequest, session: Session = Depends(get_session)):
    idinfo = verify_google_token(request.token)
    if not idinfo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )
    
    email = idinfo.get('email')
    name = idinfo.get('name', '')
    
    # Check if user exists
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if not user:
        # Create a new user
        # Generate a username from email (everything before @)
        base_username = email.split('@')[0]
        # Ensure username is unique
        username = base_username
        counter = 1
        while session.exec(select(User).where(User.username == username)).first():
            username = f"{base_username}{counter}"
            counter += 1
            
        import secrets
        # Dummy random password since they use Google
        random_password = secrets.token_urlsafe(16)
        
        user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(random_password)
        )
        session.add(user)
        session.commit()
        session.refresh(user)

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
                category=str(row['category']),
                user_id=current_user.id
            )
            session.add(revenue_entry)
        
        session.commit()
        return {"message": "Data uploaded and processed successfully", "rows_processed": len(df)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def get_stats(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(RevenueData).where(RevenueData.user_id == current_user.id)
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
def get_advanced_analytics(
    time_range: str = "30d", 
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    statement = select(RevenueData).where(RevenueData.user_id == current_user.id)
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
    if time_range == "custom" and start_date and end_date:
        final_end = pd.to_datetime(end_date)
        final_start = pd.to_datetime(start_date)
        diff_days = (final_end - final_start).days
        prev_start = final_start - pd.Timedelta(days=diff_days)
    elif time_range == "ytd":
        final_end = max_date
        final_start = pd.Timestamp(year=pd.Timestamp.now().year, month=1, day=1)
        prev_start = pd.Timestamp(year=pd.Timestamp.now().year - 1, month=1, day=1)
    else:
        if time_range == "7d":
            days = 7
        elif time_range == "90d":
            days = 90
        elif time_range == "12m":
            days = 365
        else:
            days = 30 # Default
        final_end = max_date
        final_start = max_date - pd.Timedelta(days=days)
        prev_start = final_start - pd.Timedelta(days=days)
    
    # Filter Data for Current Period
    current_df = df[(df['date'] >= final_start) & (df['date'] <= final_end)]
    
    # Filter Data for Previous Period (for Growth Rate)
    prev_df = df[(df['date'] >= prev_start) & (df['date'] < final_start)]
    
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
def get_forecast(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(RevenueData).where(RevenueData.user_id == current_user.id)
    results = session.exec(statement).all()
    
    if not results:
         return {"historical": [], "forecast": [], "narrative": "No data available."}
         
    # Convert to DataFrame
    data = [row.dict() for row in results]
    df = pd.DataFrame(data)
    
    forecast_results = generate_ai_forecast(df)
    
    return forecast_results

@app.delete("/data")
def clear_data(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = delete(RevenueData).where(RevenueData.user_id == current_user.id)
    session.exec(statement)
    session.commit()
    return {"message": "All data cleared successfully"}

from models import RevenueData
from ml_logic import train_and_predict, predict_churn_risk

# ... existing code ...

@app.get("/customers")
def get_customers(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(RevenueData).where(RevenueData.user_id == current_user.id)
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
def get_customer_details(customer_name: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    statement = select(RevenueData).where(RevenueData.customer_name == customer_name, RevenueData.user_id == current_user.id).order_by(RevenueData.date.desc())
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

@app.post("/customers/{customer_name}/generate-pitch")
def generate_customer_pitch(customer_name: str, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    import traceback
    try:
        # Get all transactions for context
        statement = select(RevenueData).where(
            RevenueData.customer_name == customer_name,
            RevenueData.user_id == current_user.id
        ).order_by(RevenueData.date.desc())
        results = session.exec(statement).all()
        
        if not results:
            raise HTTPException(status_code=404, detail="Customer not found or has no data")

        # Aggregate Data
        df = pd.DataFrame([row.dict() for row in results])
        df['date'] = pd.to_datetime(df['date'])
        
        total_revenue = float(df['amount'].sum())
        transaction_count = len(df)
        
        # Safe date formatting using pandas Timestamp
        recent_transactions = []
        for _, row in df.head(5).iterrows():
            recent_transactions.append({
                "date": str(row['date'])[:10],  # Safe ISO format slice
                "category": str(row['category']),
                "amount": float(row['amount'])
            })
        
        # Get Churn Risk Context — safely, since predict_churn_risk needs 'id' col
        churn_risk_label = "Unknown"
        churn_reason = "Not enough data"
        try:
            if 'id' in df.columns:
                churn_risks = predict_churn_risk(df)
                risk_data = churn_risks.get(customer_name, {"risk": "Unknown", "reason": "Not enough data"})
                churn_risk_label = risk_data.get("risk", "Unknown")
                churn_reason = risk_data.get("reason", "Not enough data")
        except Exception as e:
            print(f"Churn risk calculation warning (non-fatal): {e}")

        # Call AI Service
        pitch = generate_personalized_pitch(
            customer_name=customer_name,
            total_revenue=total_revenue,
            transaction_count=transaction_count,
            recent_transactions=recent_transactions,
            churn_risk=churn_risk_label,
            churn_reason=churn_reason
        )
        return {"pitch": pitch}
    except HTTPException:
        raise
    except ValueError as ve:
        print(f"ValueError in generate_customer_pitch: {ve}")
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        print(f"Unexpected error in generate_customer_pitch:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An error occurred while generating the pitch.")

def create_pie_chart(category_list):
    if not category_list: return None
    labels = [c['name'] for c in category_list]
    sizes = [c['value'] for c in category_list]
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
    ax.axis('equal')
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close(fig)
    return buf.getvalue()

def create_scatter_chart(scatter_data):
    if not scatter_data: return None
    fig, ax = plt.subplots(figsize=(6, 4))
    
    colors = {'High Risk': '#d32f2f', 'Medium Risk': '#ed6c02', 'Low Risk': '#2e7d32', 'Unknown': '#9e9e9e'}
    
    for entry in scatter_data:
        ax.scatter(entry['recency'], entry['revenue'], c=colors.get(entry['risk'], '#9e9e9e'), alpha=0.7)
        
    ax.set_xlabel('Days Since Last Purchase')
    ax.set_ylabel('Total Revenue ($)')
    ax.set_title('Churn Risk Analysis')
    ax.grid(True, linestyle='--', alpha=0.6)
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close(fig)
    return buf.getvalue()

@app.get("/reports/executive-summary")
def get_executive_summary_report(
    time_range: str = "30d", 
    risk_levels: Optional[str] = None, 
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    statement = select(RevenueData).where(RevenueData.user_id == current_user.id)
    results = session.exec(statement).all()
    
    if not results:
        raise HTTPException(status_code=404, detail="No data available to generate report")
        
    data = [row.dict() for row in results]
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    
    # Calculate Metrics (Similar to Advanced Analytics)
    max_date = df['date'].max()
    if time_range == "custom" and start_date and end_date:
        final_end = pd.to_datetime(end_date)
        final_start = pd.to_datetime(start_date)
        days_diff = (final_end - final_start).days
        prev_start = final_start - pd.Timedelta(days=days_diff)
        time_label = f"Custom: {start_date} to {end_date}"
    elif time_range == "ytd":
        final_end = max_date
        final_start = pd.Timestamp(year=pd.Timestamp.now().year, month=1, day=1)
        prev_start = pd.Timestamp(year=pd.Timestamp.now().year - 1, month=1, day=1)
        time_label = "YTD"
    else:
        if time_range == "7d":
            days = 7
            time_label = "7 days"
        elif time_range == "90d":
            days = 90
            time_label = "Quarter"
        elif time_range == "12m":
            days = 365
            time_label = "Year"
        else:
            days = 30 # Default
            time_label = "Month"
        final_end = max_date
        final_start = max_date - pd.Timedelta(days=days)
        prev_start = final_start - pd.Timedelta(days=days)

    current_df = df[(df['date'] >= final_start) & (df['date'] <= final_end)]
    prev_df = df[(df['date'] >= prev_start) & (df['date'] < final_start)]
    
    current_revenue = float(current_df['amount'].sum())
    prev_revenue = float(prev_df['amount'].sum())
    
    growth_rate = 0.0
    if prev_revenue > 0:
        growth_rate = ((current_revenue - prev_revenue) / prev_revenue) * 100
        
    active_customers = int(current_df['customer_name'].nunique())
    arpu = float(current_revenue / active_customers) if active_customers > 0 else 0
    
    # Top Customers
    top_customers_df = current_df.groupby('customer_name')['amount'].sum().nlargest(5).reset_index()
    top_customers = [
        {"customer_name": row['customer_name'], "revenue": float(row['amount'])}
        for _, row in top_customers_df.iterrows()
    ]
    
    # Generate Charts
    category_split = current_df.groupby('category')['amount'].sum().reset_index()
    category_list = [{"name": row['category'], "value": float(row['amount'])} for _, row in category_split.iterrows()]
    pie_chart_bytes = create_pie_chart(category_list)
    
    churn_risks = predict_churn_risk(df)
    customer_stats = df.groupby('customer_name').agg({'amount': 'sum', 'date': 'max'}).reset_index()
    now = pd.Timestamp.now()
    
    scatter_data = []
    risk_customers_dict = {'High Risk': [], 'Medium Risk': [], 'Low Risk': []}
    
    for _, row in customer_stats.iterrows():
        cname = row['customer_name']
        risk_data = churn_risks.get(cname, {"risk": "Unknown", "reason": ""})
        risk = risk_data["risk"]
        recency = (now - row['date']).days
        scatter_data.append({'recency': recency, 'revenue': row['amount'], 'risk': risk, 'name': cname})
        
        if risk in risk_customers_dict:
            risk_customers_dict[risk].append({'name': cname, 'revenue': row['amount'], 'reason': risk_data['reason']})
            
    scatter_chart_bytes = create_scatter_chart(scatter_data)
    
    # Filter requested risk lists
    requested_risks = [r.strip() for r in risk_levels.split(',')] if risk_levels else []
    filtered_risk_lists = {r: sorted(risk_customers_dict[r], key=lambda x: x['revenue'], reverse=True) 
                           for r in requested_risks if r in risk_customers_dict}
    
    # Generate AI Summary
    print("Generating AI Executive Summary...")
    ai_summary = generate_executive_summary(
        total_revenue=current_revenue,
        active_customers=active_customers,
        arpu=arpu,
        growth_rate=growth_rate,
        time_range_label=time_label,
        top_customers=top_customers
    )
    
    # Generate PDF
    print("Generating PDF layout...")
    pdf_bytes = generate_pdf_report(
        total_revenue=current_revenue,
        active_customers=active_customers,
        arpu=arpu,
        growth_rate=growth_rate,
        time_range_label=time_label,
        top_customers=top_customers,
        ai_summary=ai_summary,
        pie_chart_bytes=pie_chart_bytes,
        scatter_chart_bytes=scatter_chart_bytes,
        filtered_risk_lists=filtered_risk_lists
    )
    
    # Return as downloadable file
    headers = {
        'Content-Disposition': f'attachment; filename="Executive_Revenue_Report_{time_range}.pdf"'
    }
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

class CopilotQueryRequest(BaseModel):
    query: str

@app.post("/ai/copilot")
def ai_copilot(
    request: CopilotQueryRequest, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import text
    
    # 1. Translate Query to SQL
    try:
        ai_response = translate_query_to_sql(request.query)
        sql = ai_response.get("sql", "")
        explanation = ai_response.get("explanation", "I couldn't generate a query for that.")
        visual_hint = ai_response.get("visual_hint", "table")
        
        if not sql:
            return {
                "explanation": explanation,
                "data": [],
                "visual_hint": visual_hint
            }
        
        # 2. Secure and Execute SQL
        # Replace the user_id placeholder with the actual current user ID
        # Also force read-only by checking for forbidden keywords (very basic sanitization)
        forbidden = ["drop", "delete", "update", "insert", "truncate", "alter", "create"]
        if any(word in sql.lower() for word in forbidden):
            raise HTTPException(status_code=400, detail="Forbidden query detected.")
            
        # Ensure user_id scoping is present
        if "[USER_ID_HINT]" in sql:
            sql = sql.replace("[USER_ID_HINT]", str(current_user.id))
        else:
            # If AI forgot the filter, we append it manually if possible, or fail for safety
            if "WHERE" in sql.upper():
                sql = sql.replace("WHERE", f"WHERE user_id = {current_user.id} AND ")
            else:
                # Add a WHERE clause if none exists
                if "GROUP BY" in sql.upper():
                    sql = sql.replace("GROUP BY", f"WHERE user_id = {current_user.id} GROUP BY")
                elif "ORDER BY" in sql.upper():
                    sql = sql.replace("ORDER BY", f"WHERE user_id = {current_user.id} ORDER BY")
                elif "LIMIT" in sql.upper():
                    sql = sql.replace("LIMIT", f"WHERE user_id = {current_user.id} LIMIT")
                else:
                    sql += f" WHERE user_id = {current_user.id}"

        # Execute
        result = session.execute(text(sql))
        rows = result.mappings().all()
        
        # Convert rows to list of dicts
        data = [dict(row) for row in rows]
        
        return {
            "explanation": explanation,
            "data": data,
            "visual_hint": visual_hint,
            "sql": sql # For debugging / transparency
        }
        
    except Exception as e:
        print(f"Copilot API Error: {e}")
        import traceback
        traceback.print_exc()
        
        # Check if it was a persistence service error
        error_msg = str(e)
        if "503" in error_msg or "unavailable" in error_msg.lower():
            friendly_error = "The AI service is currently overloaded. Please try again in a few moments."
        elif "429" in error_msg or "rate limit" in error_msg.lower():
            friendly_error = "AI rate limit reached. Please wait a minute before trying again."
        else:
            friendly_error = f"AI Error: {error_msg}"

        return {
            "explanation": friendly_error,
            "data": [],
            "visual_hint": "table",
            "error": error_msg
        }
