import pandas as pd
from typing import Dict, List

def calculate_cohorts(df: pd.DataFrame) -> Dict:
    """
    Calculates retention cohorts based on first purchase date.
    Returns:
    {
        "retention": [
            {"cohort": "2023-01", "month_0": 100, "month_1": 50, ...},
            ...
        ]
    }
    """
    if df.empty:
        return {"retention": [], "heads": []}
        
    # Ensure datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # 1. Determine Cohort (First Purchase Month) for each customer
    first_purchase = df.groupby('customer_name')['date'].min().reset_index()
    first_purchase.columns = ['customer_name', 'first_purchase_date']
    first_purchase['cohort_month'] = first_purchase['first_purchase_date'].dt.to_period('M')
    
    # Merge back
    df_merged = pd.merge(df, first_purchase, on='customer_name')
    df_merged['order_month'] = df_merged['date'].dt.to_period('M')
    
    # 2. Group by Cohort and Order Month
    cohort_data = df_merged.groupby(['cohort_month', 'order_month']).agg(n_customers=('customer_name', 'nunique')).reset_index()
    
    # Calculate offset (months since first purchase)
    cohort_data['period_number'] = (cohort_data['order_month'] - cohort_data['cohort_month']).apply(lambda x: x.n)
    
    # Pivot for validation
    cohort_pivot = cohort_data.pivot(index='cohort_month', columns='period_number', values='n_customers')
    
    # Calculate Retention Rate
    cohort_size = cohort_pivot.iloc[:, 0]
    retention_matrix = cohort_pivot.divide(cohort_size, axis=0) * 100
    
    # Format for Frontend (Array of Objects)
    retention_list = []
    
    # We want rows: cohort, month_0, month_1...
    for cohort_date, row in retention_matrix.iterrows():
        cohort_str = str(cohort_date)
        entry = {"cohort": cohort_str, "size": int(cohort_size[cohort_date])}
        
        # Add period columns
        for period in range(len(row)):
            val = row.get(period)
            if pd.notna(val):
                entry[f"month_{period}"] = round(val, 1)
            else:
                entry[f"month_{period}"] = 0
                
        retention_list.append(entry)
        
    # Heads (max period number found) to build table columns dynamically
    max_period = cohort_data['period_number'].max()
    heads = [f"month_{i}" for i in range(max_period + 1)] if not pd.isna(max_period) else ["month_0"]
    
    return {
        "retention": retention_list,
        "heads": heads
    }
