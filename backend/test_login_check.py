import requests

url = "http://127.0.0.1:5000/api/auth/login"
payload = {
    "email": "definitely_does_not_exist_99999@gmail.com",
    "password": "Password123!"
}

try:
    response = requests.post(url, json=payload, timeout=10)
    print("LOGIN STATUS CODE:", response.status_code)
    print("LOGIN RESPONSE JSON:", response.json())
except Exception as e:
    print("LOGIN REQUEST ERROR:", e)
