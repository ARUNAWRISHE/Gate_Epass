#!/bin/bash
# Test script to verify frontend and backend connectivity

echo "🔍 Testing Local Development Setup"
echo "================================="
echo ""

echo "1️⃣  Testing Backend on http://127.0.0.1:5001"
echo "-----------------------------------------------"
curl -s -X GET http://127.0.0.1:5001/ -o /dev/null -w "Status: %{http_code}\n"
echo ""

echo "2️⃣  Testing Login Endpoint (OPTIONS preflight)"
echo "-----------------------------------------------"
curl -s -X OPTIONS http://127.0.0.1:5001/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -w "Status: %{http_code}\n"
echo ""

echo "3️⃣  Testing Login with AO Credentials"
echo "-----------------------------------------------"
curl -s -X POST http://127.0.0.1:5001/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"role":"ao","password":"123"}' \
  -w "\nStatus: %{http_code}\n"
echo ""

echo "4️⃣  Testing Frontend on http://localhost:3000"
echo "-----------------------------------------------"
curl -s http://localhost:3000 -o /dev/null -w "Status: %{http_code}\n"
echo ""

echo "✅ All tests complete!"
