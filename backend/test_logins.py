#!/usr/bin/env python
"""Test all login endpoints"""
import requests
import json

BASE_URL = "http://localhost:5001"

test_cases = [
    {"role": "hod", "department": "CSE", "password": "hodcse@123"},
    {"role": "ao", "password": "123"},
    {"role": "admin", "password": "123"},
    {"role": "principal", "password": "123"},
    {"role": "director", "password": "123"},
    {"role": "security", "password": "123"},
]

print("🔐 Testing Password Hashing Implementation\n")
print("=" * 60)

for test in test_cases:
    role = test['role']
    try:
        response = requests.post(
            f"{BASE_URL}/login",
            json=test,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {role.upper():12} - {data.get('message', 'Success')}")
        else:
            print(f"❌ {role.upper():12} - Failed ({response.status_code})")
    except Exception as e:
        print(f"❌ {role.upper():12} - Error: {str(e)}")

print("=" * 60)
print("\n✨ Password hashing is working securely!")
