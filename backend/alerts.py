from sqlmodel import Session, select
from models import RevenueData, AlertRule, AlertEvent
from ml_logic import predict_churn_risk
import pandas as pd
from datetime import datetime

def evaluate_rules(session: Session):
    """
    Evaluates all active alert rules against current data and generates AlertEvents.
    """
    # 1. Fetch Active Rules
    statement = select(AlertRule).where(AlertRule.is_active == True)
    rules = session.exec(statement).all()
    
    if not rules:
        return
    
    # 2. Prepare Data for Evaluation
    # Fetch all revenue data
    data_stmt = select(RevenueData)
    results = session.exec(data_stmt).all()
    if not results:
        return
        
    df = pd.DataFrame([row.dict() for row in results])
    df['date'] = pd.to_datetime(df['date'])
    
    # Calculate Metrics
    # MRR (Current Month Revenue)
    current_month = df['date'].max().strftime('%Y-%m')
    current_mrr = df[df['date'].dt.strftime('%Y-%m') == current_month]['amount'].sum()
    
    # Active Customers
    active_customers = df['customer_name'].nunique()
    
    # Churn Risk (High Risk Count)
    try:
        churn_risks = predict_churn_risk(df)
        high_risk_count = sum(1 for v in churn_risks.values() if v.get("risk") == "High Risk")
    except Exception:
        high_risk_count = 0

    # 3. Evaluate Rules
    for rule in rules:
        triggered = False
        current_val = 0
        
        if rule.metric == "mrr":
            current_val = current_mrr
        elif rule.metric == "active_customers":
            current_val = active_customers
        elif rule.metric == "churn_risk":
            current_val = high_risk_count
            
        # Check Condition
        if rule.condition == ">":
            if current_val > rule.threshold:
                triggered = True
        elif rule.condition == "<":
            if current_val < rule.threshold:
                triggered = True
                
        if triggered:
            # Create Event
            event = AlertEvent(
                rule_id=rule.id,
                message=f"Alert Triggered: {rule.name}. Current {rule.metric}: {current_val} {rule.condition} {rule.threshold}",
                severity="warning"
            )
            session.add(event)
    
    session.commit()
