# Backend Quick Reference Guide

## 🚀 Quick Start

### Install & Run Backend (Python 3.10)
```bash
# Navigate to backend
cd backend

# Create virtual environment (first time only)
python3.10 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python app.py

# Backend runs on: http://127.0.0.1:5001
```

### Stop Backend
```bash
# Press Ctrl+C in terminal
# Or kill process
pkill -f "python app.py"
```

---

## 🔐 Login Credentials

### Quick Test Accounts

| Role | Credentials | Purpose |
|------|-------------|---------|
| HOD | Department: CSE, Password: (from DB) | Create guest passes |
| AO | Password: `123` | Create AO requests |
| Admin | Password: `123` | Approve requests |
| Principal | Password: `123` | Review requests |
| Director | Password: `123` | Review requests |
| Security | Password: `123` | Verify guests |

**Note**: Hardcoded passwords should be changed in production!

---

## 📱 Common API Calls

### 1. Login (Get JWT Token)
```bash
curl -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin",
    "password": "123"
  }'

# Response:
# {
#   "message": "Login successful",
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {"id": 1, "name": "Admin", "role": "admin"}
# }
```

### 2. Get All Requests
```bash
curl -X GET "http://localhost:5001/all-requests?status=Pending" \
  -H "Authorization: Bearer <TOKEN>"

# Query parameters:
# - status: Pending, Accepted, Rejected
# - department: CSE, ECE, IT, etc.
# - search: search_term
# - sort_by: created_time, event_date, etc.
# - sort_order: asc, desc
```

### 3. Approve Request (Generate OTP & QR)
```bash
curl -X PUT http://localhost:5001/requests/CSE1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Accepted"
  }'

# Response:
# {
#   "message": "Request status updated to Accepted"
# }
# Side effects: OTP generated, QR code created, email sent
```

### 4. Verify Guest (Scan QR Code)
```bash
curl -X POST http://localhost:5001/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "4521"
  }'

# Response:
# {
#   "success": true,
#   "request": {
#     "guest_name": "John Doe",
#     "otp": "4521",
#     "guest_image": "http://127.0.0.1:5001/uploads/guest_xxxx.jpg",
#     ...
#   }
# }
```

### 5. Check-in Guest
```bash
curl -X POST http://localhost:5001/update-time \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "4521",
    "action": "arrived"
  }'

# Response:
# {
#   "success": true,
#   "message": "Time updated for arrived"
# }
```

### 6. Check-out Guest
```bash
curl -X POST http://localhost:5001/update-time \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "4521",
    "action": "left"
  }'

# Response:
# {
#   "success": true,
#   "message": "Time updated for left"
# }
# Side effects: Thank you email sent
```

### 7. Get Active Guests
```bash
curl -X GET http://localhost:5001/active-requests

# Response:
# [
#   {
#     "id": "CSE1",
#     "guest_name": "John Doe",
#     "guest_phone": "9876543210",
#     "event_name": "Tech Talk",
#     "Actual_intime": "02:30 PM"
#   }
# ]
```

### 8. Export Requests to CSV
```bash
curl -X GET "http://localhost:5001/export-requests?status=Accepted" \
  --output requests.csv

# Downloads filtered requests as CSV file
```

---

## 📊 API Response Patterns

### Success Response (200/201)
```json
{
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response (400/401/404/500)
```json
{
  "error": "Descriptive error message"
}
```

### List Response
```json
{
  "requests": [
    {"id": "CSE1", "guest_name": "John", ...},
    {"id": "CSE2", "guest_name": "Jane", ...}
  ],
  "total": 2
}
```

---

## 🗂️ File Organization

### Database Location
```
backend/instance/mysql.db
```

### Upload Directory
```
backend/uploads/
├── guest_1708329600.jpg          # Guest photos
├── approval_1708329600.pdf       # Approval letters
├── appreciation_1708329600.pdf   # Thank you letters
└── qr_CSE1_4521.png             # QR codes
```

### Log Files
```
backend/backend.log (if configured)
```

---

## 🔧 Environment Configuration

### Create `.env` file in backend directory

```env
# Flask Configuration
SECRET_KEY=your-super-secret-key-here

# Email Configuration (Gmail)
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password

# Database (usually auto-configured)
SQLALCHEMY_DATABASE_URI=sqlite:///instance/mysql.db

# Optional
FLASK_ENV=development
DEBUG=True
```

**Note**: Get Gmail app password from: https://myaccount.google.com/apppasswords

---

## 🔍 Database Models Quick View

### Request Model Fields
```python
id              # Unique identifier (e.g., CSE1, AO1)
name            # Requester name
department      # Department name
event_name      # Event name
event_date      # Date of event
time_in         # Expected check-in time
time_out        # Expected check-out time
guest_name      # Guest's full name
company_detail  # Company/organization
purpose         # Purpose of visit
guest_email     # Guest email address
guest_phone     # Guest phone number
status          # Pending, Accepted, Rejected
otp             # One-Time Password (4 digits)
Actual_intime   # Actual check-in time
Actual_outtime  # Actual check-out time
created_time    # Request creation timestamp
approved_time   # Approval timestamp
remarks         # Additional remarks
image           # Guest photo filename
approval_letter # Approval document filename
appreciation_letter # Thank you letter filename
mail_status     # Email delivery status
```

### HOD Model Fields
```python
id              # Auto-increment integer
name            # HOD name
email           # Email address (unique)
department      # Department name
password        # Hashed password
```

---

## 🚨 Troubleshooting

### Issue: Port 5001 Already in Use
```bash
# Find process using port 5001
lsof -i :5001

# Kill process
kill -9 <PID>

# Or use different port (modify app.py)
# app.run(port=5002)
```

### Issue: Email Not Sending
```bash
# Check environment variables
printenv | grep MAIL

# Verify Gmail app password is correct
# Generate new one: https://myaccount.google.com/apppasswords
```

### Issue: Files Not Uploading
```bash
# Check uploads directory exists
ls -la backend/uploads/

# Create if missing
mkdir -p backend/uploads/

# Check permissions
chmod 755 backend/uploads/
```

### Issue: Database Error "Database is locked"
```bash
# Delete database and restart
rm backend/instance/mysql.db
python app.py

# Alembic will recreate it
```

### Issue: Module Not Found
```bash
# Verify virtual environment activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.10.x
```

---

## 📈 Testing Workflows

### Workflow 1: Create & Approve Request
```
1. Login as HOD
   curl -X POST http://localhost:5001/login

2. Create Request
   curl -X POST http://localhost:5001/create-hod-request

3. Login as Admin
   curl -X POST http://localhost:5001/login (admin credentials)

4. View Requests
   curl -X GET http://localhost:5001/all-requests

5. Approve Request
   curl -X PUT http://localhost:5001/requests/CSE1

6. Check email - should receive QR code
```

### Workflow 2: Guest Check-in/out
```
1. Simulate QR scan - extract OTP
   OTP from QR: 4521

2. Verify Guest
   curl -X POST http://localhost:5001/verify-otp (otp: 4521)

3. Check-in
   curl -X POST http://localhost:5001/update-time (action: arrived)

4. Get Active Guests
   curl -X GET http://localhost:5001/active-requests

5. Check-out
   curl -X POST http://localhost:5001/update-time (action: left)

6. Check email - should receive thank you letter
```

---

## 🎯 Request Status Flow

```
┌─────────┐
│ PENDING │ (Initial state when request created)
└────┬────┘
     │
     ├──→ [Admin Approves]
     │
     ▼
┌────────────┐
│  ACCEPTED  │ (OTP + QR generated, email sent)
└────┬───────┘
     │
     ├──→ [Guest Checks In]
     │    └─→ Actual_intime updated
     │
     ├──→ [Guest Checks Out]
     │    └─→ Actual_outtime updated
     │    └─→ Thank you email sent
     │
     └──→ [Request Complete]
     
     OR
     
     ├──→ [Admin Rejects]
     │
     ▼
  ┌─────────┐
  │ REJECTED│
  └─────────┘
```

---

## 📞 HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request processed successfully |
| 201 | Created | New resource created |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Invalid credentials or missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database/server error |

---

## 🔑 JWT Token Info

### Token Structure
```
Header: {"alg": "HS256", "typ": "JWT"}
Payload: {
  "user_id": 1,
  "role": "admin",
  "name": "Admin",
  "exp": 1708416000  # Unix timestamp (24 hours from creation)
}
Signature: HS256(Secret)
```

### How to Use Token
```bash
# In Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Token expires after 24 hours - must login again
# Check expiration: decode token online at jwt.io
```

---

## 💾 Database Backup

### Backup Database
```bash
cp backend/instance/mysql.db backend/instance/mysql.db.backup
```

### Restore Database
```bash
cp backend/instance/mysql.db.backup backend/instance/mysql.db
```

### Clear All Data (Fresh Start)
```bash
rm backend/instance/mysql.db
python app.py  # Recreates empty database
```

---

## 📊 Admin Dashboard Data

### Key Metrics Available
```
GET /api/stats
├── total_requests
├── pending_requests
└── approved_requests

GET /active-requests
├── id
├── guest_name
├── guest_phone
├── event_name
└── Actual_intime

GET /api/departments
└── ["CSE", "ECE", "IT", ...]

GET /export-requests
└── CSV file download
```

---

## 🔄 Common Tasks

### Task: View Pending Requests
```bash
curl -X GET "http://localhost:5001/all-requests?status=Pending" \
  -H "Authorization: Bearer <TOKEN>"
```

### Task: Export Today's Requests
```bash
curl -X GET "http://localhost:5001/export-requests" \
  --output today_requests.csv
```

### Task: Find Active Guests
```bash
curl -X GET http://localhost:5001/active-requests
```

### Task: Approve Multiple Requests
```bash
# Approve CSE1
curl -X PUT http://localhost:5001/requests/CSE1 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "Accepted"}'

# Approve CSE2
curl -X PUT http://localhost:5001/requests/CSE2 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "Accepted"}'
```

---

## 📋 API Quick Reference

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| /login | POST | User login | None |
| /forgot-password | PUT | Password reset | None |
| /api/hods | GET | List all HODs | Optional |
| /api/hods | POST | Create HOD | Admin |
| /all-requests | GET | List requests | Token |
| /requests/<id> | PUT | Approve/reject | Token |
| /verify-otp | POST | Verify guest | None |
| /update-time | POST | Check-in/out | None |
| /active-requests | GET | Active guests | None |
| /api/stats | GET | Statistics | None |
| /export-requests | GET | CSV export | Token |
| /uploads/<file> | GET | Download file | None |

---

## ⚡ Performance Tips

### Optimize Queries
- Use pagination: `?page=1&per_page=20`
- Filter early: `?status=Pending`
- Sort efficiently: `?sort_by=created_time`

### Reduce File Size
- Compress images before upload
- Limit PDF file sizes
- Clean up old uploads regularly

### Manage Database
- Use indexes on frequently filtered columns
- Archive old requests periodically
- Regular backups

---

## 🎓 Learning Resources

### File Locations
- **Main App**: `backend/app.py`
- **Database**: `backend/instance/mysql.db`
- **Uploads**: `backend/uploads/`
- **Config**: `backend/.env`

### Key Technologies
- **Flask**: Micro web framework
- **SQLAlchemy**: ORM for database
- **JWT**: Token-based authentication
- **SMTP**: Email sending
- **QRCode**: QR generation

### Useful Links
- Flask Docs: https://flask.palletsprojects.com/
- SQLAlchemy: https://www.sqlalchemy.org/
- JWT: https://jwt.io/
- Gmail SMTP: https://support.google.com/accounts/answer/185833

---

## 🎯 Next Steps

1. ✅ **Backend Running**: Verify at http://127.0.0.1:5001
2. ✅ **Frontend Running**: Should be at http://localhost:3000
3. **Test Login**: Try logging in from frontend
4. **Create Request**: Create a test guest pass request
5. **Approve & Test**: Approve and test full workflow
6. **Check Logs**: Monitor backend logs for issues

---

## 📞 Support

### For Issues
1. Check logs: `backend.log`
2. Verify env vars: `cat .env`
3. Test manually: Use curl commands above
4. Check database: Use SQLite browser

### Common Fixes
- Empty database: `rm instance/mysql.db && python app.py`
- Missing emails: Verify `.env` credentials
- Port conflict: Kill process or change port
- Permission error: Check `uploads/` directory permissions

---

**Last Updated**: February 19, 2026
**Backend Status**: ✅ Running on port 5001
**Python Version**: 3.10.14

