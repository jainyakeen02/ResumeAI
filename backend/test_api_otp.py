import requests

url = "http://127.0.0.1:5000/api/auth/send-register-otp"
payload = {
    "username": "TestUser999",
    "email": "jainyakeen02@gmail.com",
    "password": "Password123!"
}

try:
    response = requests.post(url, json=payload, timeout=15)
    print("STATUS CODE:", response.status_code)
    print("RESPONSE JSON:", response.json())
except Exception as e:
    print("HTTP REQUEST ERROR:", e)
