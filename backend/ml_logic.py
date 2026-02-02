import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline
import numpy as np
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def train_and_predict(data: pd.DataFrame, months_to_predict: int = 3):
    """
    Trains a Polynomial Regression model (degree 2) on monthly revenue data
    and predicts future revenue.
    """
    if data.empty:
        return {"historical": [], "forecast": []}

    # Ensure date is datetime
    data['date'] = pd.to_datetime(data['date'])
    
    # Aggregate by month
    monthly_data = data.resample('ME', on='date')['amount'].sum().reset_index()
    monthly_data['month_index'] = np.arange(len(monthly_data))
    
    # Prepare X and y
    X = monthly_data[['month_index']]
    y = monthly_data['amount']
    
    # Train model (Polynomial Regression Degree 2)
    model = make_pipeline(PolynomialFeatures(degree=2), LinearRegression())
    model.fit(X, y)
    
    # Predict for future months
    last_month_index = int(monthly_data['month_index'].max())
    future_indices = np.arange(last_month_index + 1, last_month_index + 1 + months_to_predict).reshape(-1, 1)
    predictions = model.predict(future_indices)
    
    # Format results
    historical_results = []
    for _, row in monthly_data.iterrows():
        historical_results.append({
            "month": row['date'].strftime('%Y-%m'),
            "revenue": float(row['amount'])
        })
        
    forecast_results = []
    # Use the LAST date from historical data as the anchor
    last_hist_date = monthly_data['date'].max()
    
    for i, pred in enumerate(predictions):
        # Add i+1 months to get next months
        future_date = last_hist_date + pd.DateOffset(months=i+1)
        forecast_results.append({
            "month": future_date.strftime('%Y-%m'),
            "revenue": max(0, float(pred)) # Ensure no negative revenue
        })
        
    return {
        "historical": historical_results,
        "forecast": forecast_results
    }

def predict_churn_risk(df: pd.DataFrame):
    """
    Classify customers into High, Medium, and Low Risk groups using RFM Analysis + K-Means.
    Returns a dictionary: {customer_name: {"risk": "High Risk", "reason": "Inactive for 95 days"}}
    """
    if df.empty:
        return {}
        
    # 1. RFM Aggregation
    # Recency (days since last purchase), Frequency (count), Monetary (sum)
    now = df['date'].max()
    rfm = df.groupby('customer_name').agg({
        'date': lambda x: (now - x.max()).days, # Recency
        'id': 'count', # Frequency
        'amount': 'sum' # Monetary
    }).rename(columns={'date': 'recency', 'id': 'frequency', 'amount': 'monetary'})
    
    # 2. Preprocessing
    scaler = StandardScaler()
    rfm_scaled = scaler.fit_transform(rfm)
    
    # 3. Hybrid approach: Rules for small data, AI for large data
    n_samples = len(rfm)
    results = {}
    
    # helper for formatting reason
    def get_reason(row):
        return f"Inactive for {int(row['recency'])} days"

    # helper for rule-based
    def apply_rules(rfm_df):
        res = {}
        for customer, row in rfm_df.iterrows():
            reason = get_reason(row)
            if row['recency'] > 90:
                res[customer] = {"risk": "High Risk", "reason": reason}
            elif row['recency'] > 30:
                res[customer] = {"risk": "Medium Risk", "reason": reason}
            else:
                res[customer] = {"risk": "Low Risk", "reason": "Active recently"}
        return res

    if n_samples < 5:
        return apply_rules(rfm)

    # AI Approach (K-Means)
    try:
        # Dynamic cluster count (max 3)
        n_clusters = min(3, n_samples)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        rfm['cluster'] = kmeans.fit_predict(rfm_scaled)
        
        # Map Clusters to Risk Levels based on Recency
        cluster_recency = rfm.groupby('cluster')['recency'].mean()
        sorted_clusters = cluster_recency.sort_values(ascending=False).index.tolist()
        
        risk_labels = ['High Risk', 'Medium Risk', 'Low Risk']
        # Handle cases where we have fewer than 3 clusters
        if n_clusters == 2:
            risk_labels = ['High Risk', 'Low Risk']
        elif n_clusters == 1:
            risk_labels = ['Medium Risk'] 
            
        risk_map = {cluster: label for cluster, label in zip(sorted_clusters, risk_labels)}
        
        for customer, row in rfm.iterrows():
            risk_level = risk_map.get(row['cluster'], "Unknown")
            reason = get_reason(row)
            if risk_level == "Low Risk":
                reason = "Active recently"
            results[customer] = {"risk": risk_level, "reason": reason}
            
        return results
        
    except Exception as e:
        print(f"K-Means Failed, falling back to rules: {e}")
        return apply_rules(rfm)
