import requests

def verify_otp(email, otp):
    url = "http://127.0.0.1:8000/verify-otp"
    payload = {"email": email, "otp": otp}
    resp = requests.post(url, json=payload)
    print('Status:', resp.status_code)
    print('Response:', resp.json())

if __name__ == '__main__':
    # Example usage (replace with actual OTP from login)
    verify_otp('camay16375@hidevak.com', '372551')
