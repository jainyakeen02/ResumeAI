"""Quick SMTP test - run this once to verify Gmail credentials work."""
import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

username = os.environ.get("MAIL_USERNAME", "")
password = os.environ.get("MAIL_PASSWORD", "")

print("Testing SMTP with username:", username)
print("Password length:", len(password), "chars")

if not username or not password:
    print("ERROR: MAIL_USERNAME or MAIL_PASSWORD is empty in .env file!")
    exit(1)

try:
    with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as server:
        server.ehlo()
        server.starttls()
        server.login(username, password)
        print("SUCCESS: Gmail SMTP login worked! Email sending will work.")
except smtplib.SMTPAuthenticationError as e:
    print("SMTP Auth Failed:", str(e))
    print("")
    print("Fix options:")
    print("  1. Make sure 2-Step Verification is ON for", username)
    print("  2. Generate an App Password at: myaccount.google.com > Security > App Passwords")
    print("  3. Use the 16-char App Password (spaces are OK)")
except Exception as e:
    print("Connection error:", type(e).__name__, str(e))
