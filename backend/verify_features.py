import pandas as pd
from datetime import datetime
from ml_logic import predict_churn_risk
from alerts import evaluate_rules
from cohorts import calculate_cohorts
from models import AlertRule, RevenueData, AlertEvent
from sqlmodel import Session, SQLModel, create_engine, select
import numpy as np

# Setup In-Memory DB for testing
engine = create_engine("sqlite:///:memory:")
SQLModel.metadata.create_all(engine)

def test_churn_explanation():
    print("\n--- Testing Churn Explanation ---")
    data = {
        'customer_name': ['A', 'B', 'B', 'C', 'C', 'C', 'D'],
        'amount': [100, 100, 50, 100, 200, 300, 50],
        'date': [
            datetime.now(), 
            datetime.now() - pd.Timedelta(days=100), # B inactive
            datetime.now() - pd.Timedelta(days=120),
            datetime.now(), # C active
            datetime.now(),
            datetime.now(),
            datetime.now() - pd.Timedelta(days=95) # D inactive and low spend
        ],
        'id': range(7)
    }
    df = pd.DataFrame(data)
    risks = predict_churn_risk(df)
    
    for customer, risk in risks.items():
        print(f"Customer {customer}: {risk['risk']} - Factors: {risk['factors']}")
    
    # Assertions
    assert risks['B']['risk'] == 'High Risk', "B should be High Risk"
    assert any("Inactive" in f for f in risks['B']['factors']), "B should have inactivity factor"

def test_alerts():
    print("\n--- Testing Alerts ---")
    with Session(engine) as session:
        # Create Data
        session.add(RevenueData(date=datetime.now(), amount=5000, customer_name="X", category="A"))
        session.add(AlertRule(name="Low MRR", metric="mrr", condition="<", threshold=10000))
        session.commit()
        
        # Run Evaluation
        evaluate_rules(session)
        
        # Check Events
        events = session.exec(select(AlertEvent)).all()
        for e in events:
            print(f"Event: {e.message}")
            
        assert len(events) > 0, "Should trigger low MRR alert"

def test_cohorts():
    print("\n--- Testing Cohorts ---")
    data = {
        'customer_name': ['U1', 'U1', 'U2', 'U3'],
        'amount': [10, 10, 10, 10],
        'date': [
            pd.Timestamp('2023-01-01'), 
            pd.Timestamp('2023-02-01'), # U1 retained
            pd.Timestamp('2023-01-15'), # U2 Jan cohhort
            pd.Timestamp('2023-02-20')  # U3 Feb cohort
        ],
        'id': range(4)
    }
    df = pd.DataFrame(data)
    cohorts = calculate_cohorts(df)
    print("Cohorts Result:", cohorts)
    
    # Jan 2023 Cohort (U1, U2) -> Size 2. Month 0 retention should be 100%. Month 1 (Feb) should have U1 (50%).
    jan_cohort = next((c for c in cohorts['retention'] if c['cohort'] == '2023-01'), None)
    assert jan_cohort is not None, "Jan 2023 cohort missing"
    assert jan_cohort['size'] == 2, "Jan cohort size should be 2"
    assert jan_cohort['month_1'] == 50.0, "Jan cohort month 1 retention should be 50%"

if __name__ == "__main__":
    try:
        test_churn_explanation()
        test_alerts()
        test_cohorts()
        print("\n✅ All Tests Passed!")
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()
