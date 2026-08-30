import os
import glob
import json
import pandas as pd
import numpy as np
from sqlalchemy import create_engine

def get_latest_run_json(runs_dir):
    """Finds the most recent run folder and returns the path to audited_checkout_quotes.json"""
    if not os.path.exists(runs_dir):
        return None
        
    subdirs = [os.path.join(runs_dir, d) for d in os.listdir(runs_dir) if os.path.isdir(os.path.join(runs_dir, d))]
    if not subdirs:
        return None
        
    latest_dir = sorted(subdirs)[-1]
    json_file = os.path.join(latest_dir, 'audited_checkout_quotes.json')
    
    if os.path.exists(json_file):
        return json_file
    return None

def clean_and_normalize_data(raw_json_path, output_csv_path):
    print(f"Loading REAL scraped quotes from {raw_json_path}...")
    with open(raw_json_path, 'r') as f:
        data = json.load(f)
        
    df = pd.DataFrame(data)
    print(f"Initial rows: {len(df)}")
    
    # 1. Handle Missing Values & Cancellations/Sold Out
    print("\n--- 1. Handling Missing Data ---")
    if 'status' in df.columns:
        df = df[df['status'] != 'sold_out']
    df = df.dropna(subset=['final_payment_total', 'audited_base_fare'])
    print(f"Rows after dropping missing fares: {len(df)}")

    # 2. De-duplication
    print("\n--- 2. De-duplication ---")
    df = df.sort_values(by=['flight_number', 'route', 'horizon', 'final_payment_total'])
    df = df.drop_duplicates(subset=['flight_number', 'route', 'horizon'], keep='first')
    print(f"Rows after deduplication: {len(df)}")
    
    # 3. Disaggregation / Normalization (Base Fare, Taxes, Seat Fees)
    print("\n--- 3. Normalization ---")
    df['final_payment_total'] = pd.to_numeric(df['final_payment_total'], errors='coerce')
    df['audited_base_fare'] = pd.to_numeric(df['audited_base_fare'], errors='coerce')
    df['audited_taxes'] = pd.to_numeric(df['audited_taxes'], errors='coerce')
    df['seat_selection_fee'] = pd.to_numeric(df['seat_selection_fee'], errors='coerce')
    
    # 4. Outlier Removal via IQR
    print("\n--- 4. Outlier Removal (IQR) ---")
    if len(df) >= 4:
        Q1 = df['final_payment_total'].quantile(0.25)
        Q3 = df['final_payment_total'].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        outliers = df[(df['final_payment_total'] < lower_bound) | (df['final_payment_total'] > upper_bound)]
        if not outliers.empty:
            print(f"Found {len(outliers)} outliers to remove.")
            
        df = df[(df['final_payment_total'] >= lower_bound) & (df['final_payment_total'] <= upper_bound)]
        print(f"Final clean rows ready for database: {len(df)}")
    else:
        print("Dataset too small (<4 rows) for IQR detection. Skipping.")
        print(f"Final clean rows ready for database: {len(df)}")
    
    # 5. Export to CSV & Supabase (Database)
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
    df.to_csv(output_csv_path, index=False)
    print(f"\n[SUCCESS] Cleaned data successfully saved to {output_csv_path}")
    # ----- DATABASE INGESTION -----
    from dotenv import load_dotenv
    
    # Load credentials from .env file
    load_dotenv()
    
    # Use Supabase if configured in .env, otherwise fallback to local SQLite
    DB_URI = os.environ.get("SUPABASE_DB_URI")
    
    if not DB_URI:
        local_db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed", "airgo.db")
        DB_URI = f"sqlite:///{local_db_path}"
        print(f"\n[INFO] 'SUPABASE_DB_URI' not found in .env. Falling back to SQLite.")
    
    print(f"\n--- 5. Pushing to Database ({DB_URI}) ---")
    try:
        from sqlalchemy import create_engine
        engine = create_engine(DB_URI)
        df.to_sql('airfare_quotes', engine, if_exists='append', index=False)
        print("[SUCCESS] Data successfully pushed to database!")
    except Exception as e:
        print(f"[ERROR] Failed to push to database: {e}")

    print("\nSample Output:")
    print(df[['flight_number', 'carrier', 'final_payment_total', 'audited_base_fare', 'audited_taxes']])

if __name__ == "__main__":
    runs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "runs")
    raw_path = get_latest_run_json(runs_dir)
    
    if raw_path:
        clean_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "processed", "clean_quotes_real.csv")
        clean_and_normalize_data(raw_path, clean_path)
    else:
        print("No real scraped data found in the runs/ folder!")
