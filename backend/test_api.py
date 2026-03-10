import requests
import json
import os
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("1. Registering new user...")
    username = f"testuser_{os.urandom(4).hex()}"
    res = requests.post(f"{BASE_URL}/register", json={"username": username, "email": f"{username}@test.com", "hashed_password": "password"})
    if res.status_code != 201:
        print(f"FAILED TO REGISTER: {res.text}")
        return

    print("2. Logging in...")
    res = requests.post(f"{BASE_URL}/token", data={"username": username, "password": "password"})
    if res.status_code != 200:
        print(f"FAILED TO LOGIN: {res.text}")
        return
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("3. Uploading data...")
    try:
        with open("sales_data.csv", "rb") as f:
            res = requests.post(f"{BASE_URL}/upload", headers=headers, files={"file": f})
            if res.status_code != 200:
                print(f"FAILED TO UPLOAD: {res.text}")
                return
            print(f"Upload success: {res.json()}")
    except Exception as e:
        print(f"Exception during upload: {e}")
        return

    print("4. Fetching /stats...")
    res = requests.get(f"{BASE_URL}/stats", headers=headers)
    if res.status_code != 200:
        print(f"FAILED /stats: {res.text}")
    else:
        print("Success /stats")

    print("5. Fetching /analytics/advanced...")
    res = requests.get(f"{BASE_URL}/analytics/advanced?time_range=30d", headers=headers)
    if res.status_code != 200:
        print(f"FAILED /analytics/advanced: {res.text}")
    else:
        print("Success /analytics/advanced")

    print("6. Fetching /customers...")
    res = requests.get(f"{BASE_URL}/customers", headers=headers)
    if res.status_code != 200:
        print(f"FAILED /customers: {res.text}")
    else:
        print("Success /customers")

    print("7. Fetching /forecast...")
    res = requests.get(f"{BASE_URL}/forecast", headers=headers)
    if res.status_code != 200:
        print(f"FAILED /forecast: {res.text}")
    else:
        print("Success /forecast")

if __name__ == "__main__":
    try:
        # Check if server is running
        requests.get(f"{BASE_URL}/docs")
    except Exception:
        print("ERROR: SERVER IS NOT RUNNING")
        sys.exit(1)
        
    run_tests()
