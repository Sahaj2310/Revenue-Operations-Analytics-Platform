import requests

BASE_URL = "http://localhost:8000"

def test_auth():
    print("Testing Authentication...")
    
    # 1. Register
    username = "testuser_verify"
    password = "password123"
    email = "test@example.com"
    
    reg_data = {"username": username, "password": password, "email": email, "hashed_password": password} # hashed_password field reused for password in register model for simplicity or mismatch? 
    # Wait, the model User has hashed_password. The endpoint expects User model. 
    # In main.py: def register(user: User ...). 
    # So I should send hashed_password as the password. The backend hashes it.
    
    response = requests.post(f"{BASE_URL}/register", json=reg_data)
    if response.status_code == 201:
        print("✅ Registration Successful")
    elif response.status_code == 400 and "already registered" in response.text:
       print("✅ Registration (User already exists)")
    else:
        print(f"❌ Registration Failed: {response.text}")

    # 2. Login
    login_data = {"username": username, "password": password}
    response = requests.post(f"{BASE_URL}/token", data=login_data)
    
    if response.status_code == 200:
        token = response.json().get("access_token")
        print("✅ Login Successful. Token received.")
        return token
    else:
        print(f"❌ Login Failed: {response.text}")
        return None

def test_protected_route(token):
    print("\nTesting Protected Route...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to access a protected route (e.g., DELETE /data) without actually deleting or just failing if auth works
    # Actually /data delete is dangerous. Let's try /upload with no file, expecting 422 or 400, but NOT 401.
    
    # Better: The upload endpoint wants a file.
    # If I send no auth header, I expect 401.
    response = requests.post(f"{BASE_URL}/upload")
    if response.status_code == 401:
         print("✅ Route Protected (No Auth rejected header)")
    else:
         print(f"❌ Route Protection Failed (Expected 401, got {response.status_code})")

    # With Auth
    files = {'file': ('test.csv', 'date,amount,customer_name,category\n2023-01-01,100,Test,Sales')}
    response = requests.post(f"{BASE_URL}/upload", headers=headers, files=files)
    if response.status_code == 200:
         print("✅ Authentication Validated (Upload accepted)")
    else:
         print(f"❌ Upload Failed with Auth: {response.text}")

if __name__ == "__main__":
    token = test_auth()
    if token:
        test_protected_route(token)
