import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_dummy_data(filename="sales_data.csv", num_records=1000):
    categories = ['Subscription', 'Consulting', 'Support', 'License']
    customers = [f'Customer_{i}' for i in range(1, 21)] # 20 unique customers
    
    data = []
    start_date = datetime(2023, 1, 1)
    
    for _ in range(num_records):
        # Random date within the last 12-14 months
        days_offset = random.randint(0, 365 + 60)
        date = start_date + timedelta(days=days_offset)
        
        # Random amount
        amount = round(random.uniform(50, 1000), 2)
        
        # Add basic seasonality/trend for ML to pick up
        month_factor = (date.month / 12) * 200
        amount += month_factor
        
        entry = {
            "date": date.strftime('%Y-%m-%d'),
            "amount": round(amount, 2),
            "customer_name": random.choice(customers),
            "category": random.choice(categories)
        }
        data.append(entry)
        
    df = pd.DataFrame(data)
    df.to_csv(filename, index=False)
    print(f"Generated {filename} with {num_records} records.")

if __name__ == "__main__":
    generate_dummy_data()
