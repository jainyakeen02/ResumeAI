import requests
import random

url = "http://127.0.0.1:5000/api/auth/register"
test_email = f"testuser_{random.randint(1000, 9999)}@gmail.com"
payload = {
    "username": f"User_{random.randint(1000, 9999)}",
    "email": test_email,
    "password": "Password123!"
}

try:
    response = requests.post(url, json=payload, timeout=10)
    print("STATUS CODE:", response.status_code)
    print("RESPONSE JSON:", response.json())
except Exception as e:
    print("REQUEST ERROR:", e)
