# Gate_Epass Backend - Comprehensive Analysis

## Overview
The Gate_Epass backend is a Flask-based REST API application built for managing guest pass entries and approvals at KGISL Institute of Technology. It handles event management, guest registration, OTP verification, and QR code generation.

---

## 🏗️ Architecture & Technology Stack

### Framework & Libraries
- **Flask 2.2.5** - Lightweight Python web framework
- **Flask-SQLAlchemy 3.0.3** - ORM for database operations
- **Flask-CORS 3.0.10** - Cross-Origin Resource Sharing support
- **Flask-Migrate 4.0.4** - Database migration management
- **PyJWT 2.11.0** - JWT token generation and verification
- **python-dotenv 0.21.1** - Environment variable management

### Database
- **SQLite** (`mysql.db`) - Lightweight relational database
- **Database Location**: `backend/instance/mysql.db`

### Additional Libraries
- **Pillow 9.5.0** - Image processing for guest photos
- **qrcode 7.4.2** - QR code generation
- **pandas 1.5.3** - Data analysis and CSV/Excel operations
- **openpyxl 3.0.10** - Excel file handling
- **email-validator 1.3.1** - Email validation
- **Werkzeug 2.2.3** - Security utilities for password hashing
- **gunicorn 20.1.0** - Production WSGI server

### Python Version
- **Python 3.10.14** (as configured)

---

## 📊 Database Models

### 1. **HOD Model** (Head of Department)
```
Attributes:
- id (Integer, Primary Key)
- name (String, 100 chars, Required)
- email (String, 100 chars, Unique, Required)
- department (String, 50 chars, Required)
- password (String, 100 chars, Hashed, Required)
```
**Purpose**: Store HOD credentials for authentication

---

### 2. **Request Model** (Guest Pass Requests)
```
Attributes:
- id (String, Primary Key) - Format: "DEPT_PREFIX#" or "AO#"
- name (String, 100 chars) - Requester name
- department (String, 50 chars) - Department of requester
- event_name (String, 200 chars) - Event name
- event_date (String, 50 chars) - Event date
- time_in (String, 50 chars) - Expected entry time
- time_out (String, 50 chars) - Expected exit time
- guest_name (String, 100 chars) - Guest's name
- company_detail (String, 200 chars) - Company/Organization
- purpose (String, 300 chars) - Purpose of visit
- guest_email (String, 100 chars) - Guest email
- guest_phone (String, 20 chars) - Guest phone number
- approval_letter (String, 300 chars) - Stored filename
- image (String, 300 chars) - Guest photo filename
- created_time (DateTime) - Request creation timestamp
- status (String, 20 chars) - "Pending", "Accepted", "Rejected", etc.
- approved_time (String, 50 chars) - Approval timestamp
- staff_id (Integer, Nullable) - HOD ID who created request
- otp (String, 50 chars) - One-Time Password for entry
- Actual_intime (String, 50 chars) - Actual check-in time
- Actual_outtime (String, 50 chars) - Actual check-out time
- remarks (String, 300 chars) - Additional remarks
- mail_status (String, 50 chars) - Email delivery status
- appreciation_letter (String, 300 chars) - Thank you letter filename
```
**Purpose**: Store all guest pass request information

---

### 3. **AccompanyPerson Model** (Accompanying Guests)
```
Attributes:
- id (Integer, Primary Key)
- request_id (Integer, Foreign Key) - Reference to Request
- name (String, 100 chars) - Accompanying person name
- phone (String, 15 chars) - Phone number
- created_at (DateTime) - Record creation timestamp
```
**Purpose**: Store details of accompanying persons for each request

---

### 4. **TransportRequest Model** (Transportation Details)
```
Attributes:
- id (Integer, Primary Key)
- mode_of_transport (String, 10 chars) - Transport mode
- vehicle_type (String, 20 chars, Nullable) - Type of vehicle
- vehicle_number (String, 20 chars, Nullable) - Vehicle registration
```
**Purpose**: Store transportation requests for guests

---

## 🔐 Authentication & Security

### JWT Token System
- **Token Generation**: `generate_token(user_data)`
  - Includes: user_id, role, name, expiration (24 hours)
  - Algorithm: HS256
  - Secret Key: From environment variable `SECRET_KEY`

- **Token Verification**: `verify_token(token)`
  - Validates token signature and expiration
  - Returns decoded user data or None

### Decorators
- **@token_required**: Protects routes requiring authentication
  - Expects `Authorization: Bearer <token>` header
  - Returns 401 if token missing/invalid/expired

- **@role_required(allowed_roles)**: Role-based access control
  - Validates user role matches allowed roles
  - Returns 403 if insufficient permissions

### Password Security
- Passwords hashed using **Werkzeug generate_password_hash()**
- Verification using **check_password_hash()**

### File Upload Security
- Files stored in `uploads/` directory
- Allowed image extensions: jpg, jpeg, png
- Filenames prefixed with timestamp to ensure uniqueness

---

## 📡 API Endpoints

### Authentication Routes

#### 1. **Login**
```
POST /login
Headers: Content-Type: application/json
Body: {
  "role": "hod|ao|principal|director|admin|security",
  "password": "password",
  "department": "department_name" (for HOD role)
}
Response: {
  "message": "Login successful",
  "user": { "id", "name", "role", "department" },
  "token": "JWT_TOKEN"
}
Status: 200 (Success) | 401 (Invalid credentials) | 400 (Invalid role)
```

#### 2. **Forgot Password**
```
PUT /forgot-password
Headers: Content-Type: application/json
Body: {
  "email": "hod@email.com",
  "newPassword": "new_password" (optional)
}
Response: {
  "success": true,
  "message": "Password updated successfully!"
}
Status: 200 (Success) | 404 (Email not found)
```

---

### HOD Management Routes

#### 3. **Get All HODs**
```
GET /api/hods
Response: [
  {
    "id": 1,
    "name": "HOD Name",
    "email": "hod@email.com",
    "department": "Department"
  }
]
Status: 200 (Success) | 500 (Error)
```

#### 4. **Create HOD**
```
POST /api/create-hod
Headers: Content-Type: application/json
Body: {
  "name": "HOD Name",
  "email": "hod@email.com",
  "department": "Department",
  "password": "password"
}
Response: { "message": "HOD added successfully!" }
Status: 200 (Success) | 500 (Error)
```

#### 5. **Update HOD**
```
PUT /api/update-hod/<hod_id>
Headers: Content-Type: application/json
Body: {
  "name": "Updated Name",
  "email": "updated@email.com",
  "department": "Department",
  "password": "new_password" (optional)
}
Response: { "message": "HOD updated successfully!" }
Status: 200 (Success) | 404 (Not found) | 500 (Error)
```

#### 6. **Delete HOD**
```
DELETE /api/delete-hod/<hod_id>
Response: { "message": "HOD deleted successfully!" }
Status: 200 (Success) | 404 (Not found) | 500 (Error)
```

---

### Request Creation Routes

#### 7. **Create HOD Request**
```
POST /create-hod-request
Headers: Content-Type: multipart/form-data
Body (Form-data):
- name: Staff name
- event_name: Event name
- event_date: Event date
- time_in: Expected check-in time
- time_out: Expected check-out time
- guest_name: Guest name
- company_detail: Company details
- purpose: Purpose of visit
- guest_email: Guest email
- guest_phone: Guest phone
- hod_id: HOD ID
- approvalLetter: PDF file
- appreciation_letter: PDF file
- image: JPG/PNG/JPEG file

Response: {
  "message": "HOD request created successfully",
  "request_id": "DEPT1"
}
Status: 201 (Created) | 400 (Missing required fields) | 500 (Error)
```

#### 8. **Create AO Request**
```
POST /create-ao-request
Headers: Content-Type: multipart/form-data
Body (Form-data):
- event_name, event_date, time_in, time_out
- guest_name, company_detail, purpose
- guest_email, guest_phone
- accompanyPersons: Array of {name, phone}

Response: {
  "message": "Request created successfully.",
  "requestId": "AO1"
}
Status: 201 (Created) | 500 (Error)
```

---

### Request Management Routes

#### 9. **Get All Requests**
```
GET /all-requests?status=Pending&department=CSE&search=query&sort_by=created_time&sort_order=desc&future_events_only=false

Query Parameters:
- status: Filter by status (Pending, Accepted, Rejected)
- department: Filter by department
- search: Search by name, event, or department
- sort_by: Column to sort by (default: created_time)
- sort_order: asc or desc (default: desc)
- future_events_only: true/false

Response: {
  "requests": [
    {
      "id": "DEPT1",
      "name": "Staff name",
      "department": "CSE",
      "event_name": "Event",
      "event_date": "2026-02-20",
      "status": "Pending",
      ...
    }
  ],
  "total": 5
}
Status: 200 (Success) | 500 (Error)
```

#### 10. **Get HOD Requests**
```
GET /requests/<hod_id>
Response: [
  {
    "id": "DEPT1",
    "event_name": "Event",
    "guest_name": "Guest",
    "event_date": "2026-02-20",
    "created_time": "2026-02-19 14:30:45",
    "status": "Pending",
    "approved_time": "Not Approved",
    "remarks": "Not Added"
  }
]
Status: 200 (Success) | 404 (Staff not found) | 500 (Error)
```

#### 11. **Update Request Status**
```
PUT /requests/<request_id>
Headers: Content-Type: application/json
Body: {
  "status": "Accepted|Rejected"
}
Response: {
  "message": "Request status updated to Accepted"
}
Status: 200 (Success) | 404 (Not found) | 500 (Error)

Side Effects:
- Generates OTP (4-digit random number)
- Generates QR code image (embedded with OTP)
- Sends QR code to guest email
- Sets approved_time to current datetime
```

#### 12. **Update Principal Request**
```
PUT /principal-requests/<request_id>
Headers: Content-Type: application/json
Body: {
  "status": "Approved|Rejected",
  "remarks": "Additional remarks" (optional)
}
Response: { "message": "Request updated successfully" }
Status: 200 (Success) | 404 (Not found)
```

#### 13. **Add Remarks to Request**
```
PUT /requests/<request_id>/remarks
Headers: Content-Type: application/json
Body: {
  "remarks": "Remarks text"
}
Response: { "message": "Remarks updated successfully!" }
Status: 200 (Success) | 404 (Not found)
```

---

### Guest Check-in/Check-out Routes

#### 14. **Verify OTP**
```
POST /verify-otp
Headers: Content-Type: application/json
Body: {
  "otp": "1234"
}
Response: {
  "success": true,
  "request": {
    "guest_name": "Guest Name",
    "otp": "1234",
    "actual_intime": "Not Arrived",
    "actual_outtime": "Not Arrived",
    "department": "CSE",
    "event_name": "Event",
    "time_in": "10:00 AM",
    "guest_image": "http://127.0.0.1:5001/uploads/guest_xxxx.jpg"
  }
}
Status: 200 (Success) | 404 (OTP not found) | 500 (Error)
```

#### 15. **Update Check-in/Check-out Time**
```
POST /update-time
Headers: Content-Type: application/json
Body: {
  "otp": "1234",
  "action": "arrived|left"
}
Response: {
  "success": true,
  "message": "Time updated for arrived"
}
Status: 200 (Success) | 404 (Request not found) | 400 (Invalid action/already updated)

Rules:
- Cannot check-in before scheduled time_in
- Cannot mark multiple check-ins/check-outs
- Triggers thank-you email on check-out
```

#### 16. **Get Active Requests**
```
GET /active-requests
Response: [
  {
    "id": "DEPT1",
    "guest_name": "Guest",
    "guest_phone": "9876543210",
    "event_name": "Event",
    "Actual_intime": "02:30 PM"
  }
]
Status: 200 (Success)

Filters: Requests where Actual_intime != "Not Arrived" AND Actual_outtime == "Not Arrived"
```

---

### Utility Routes

#### 17. **Get Accompanying Persons**
```
POST /add-accompany-persons
Headers: Content-Type: application/json
Body: {
  "requestId": "DEPT1",
  "accompanyPersons": [
    { "name": "Person 1", "phone": "9876543210" },
    { "name": "Person 2", "phone": "9876543211" }
  ]
}
Response: { "message": "Accompanying persons added successfully." }
Status: 201 (Created) | 400 (Invalid request ID) | 500 (Error)
```

#### 18. **Get Departments**
```
GET /api/departments
Response: ["CSE", "ECE", "IT", ...]
Status: 200 (Success) | 500 (Error)
```

#### 19. **Export Requests**
```
GET /export-requests?status=Pending&department=CSE
Query Parameters:
- status: Filter by status
- department: Filter by department

Response: CSV file download
Headers: Content-Disposition: attachment;filename=filtered_requests.csv
Status: 200 (Success) | 500 (Error)
```

#### 20. **Download Files**
```
GET /uploads/<filename>
Response: File content (image, PDF, etc.)
Status: 200 (Success) | 404 (File not found)
```

#### 21. **Get Statistics**
```
GET /api/stats
Response: {
  "total_requests": 100,
  "pending_requests": 25,
  "approved_requests": 75
}
Status: 200 (Success) | 500 (Error)
```

---

## 📧 Email Functionality

### OTP Email (on approval)
- **Trigger**: When request status is updated to "Accepted"
- **Content**: 
  - Event details
  - KGISL contact information
  - Unique QR code attachment (contains OTP)
- **Recipient**: Guest email
- **SMTP**: Gmail (smtp.gmail.com:587)
- **Credentials**: From environment variables `MAIL_USERNAME`, `MAIL_PASSWORD`

### Thank You Email (on checkout)
- **Trigger**: When guest performs check-out action
- **Content**: Thank you message + Appreciation letter attachment
- **Recipient**: Guest email
- **Attachment**: Latest appreciation letter matching event name

---

## 📁 File Management

### Upload Directory Structure
```
backend/
├── uploads/
│   ├── guest_[timestamp]_[filename].jpg/png/jpeg
│   ├── approval_[timestamp]_[filename].pdf
│   ├── appreciation_[timestamp]_[filename].pdf
│   └── qr_[request_id]_[otp].png
```

### File Naming Convention
- **Guest Images**: `guest_{timestamp}_{filename}`
- **Approval Letters**: `approval_{timestamp}_{filename}`
- **Appreciation Letters**: `appreciation_{timestamp}_{filename}`
- **QR Codes**: `qr_{request_id}_{otp}.png`

### Supported File Types
- **Images**: jpg, jpeg, png
- **Documents**: pdf (for approval/appreciation letters)

---

## 🔄 Data Flow Examples

### 1. **Guest Pass Creation Flow**
```
1. HOD logs in → Gets JWT token
2. HOD creates request → Files uploaded → Unique ID generated
3. Request stored in database → Status: "Pending"
4. Admin/Principal reviews request
5. Admin approves → OTP generated → QR code created
6. Guest receives email with QR code
```

### 2. **Guest Entry Flow**
```
1. Guest scans QR code → Contains OTP
2. Security verifies OTP → Shows guest details + photo
3. Guest checks in → Actual_intime recorded
4. Guest checks out → Actual_outtime recorded
5. Thank-you email sent with appreciation letter
```

### 3. **Request Status Flow**
```
Pending → Accepted/Rejected → OTP Generated → QR Sent → Guest Checks In → Guest Checks Out
```

---

## 🔧 Configuration & Environment

### Environment Variables Required
```
SECRET_KEY=your-secret-key
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-password
```

### Database Configuration
```
SQLALCHEMY_DATABASE_URI=sqlite:///mysql.db
SQLALCHEMY_TRACK_MODIFICATIONS=False
```

### Flask Configuration
- **DEBUG**: True (Development)
- **HOST**: 0.0.0.0
- **PORT**: 5001
- **CORS**: Enabled

---

## ⚠️ Security Considerations

### Implemented Security Features
✅ JWT-based authentication
✅ Password hashing with Werkzeug
✅ CORS enabled for frontend communication
✅ File upload validation (extension checking)
✅ OTP-based guest verification
✅ QR code generation for entry validation

### Security Recommendations
⚠️ **Use strong SECRET_KEY** in production
⚠️ **Hardcoded passwords** for some roles (ao, principal) should use database
⚠️ **HTTPS** required in production
⚠️ **Rate limiting** not implemented
⚠️ **Input validation** could be more robust
⚠️ **SQL injection** prevention relies on SQLAlchemy ORM

---

## 🚀 Running the Backend

### Development
```bash
cd backend
source venv/bin/activate
python app.py
```
- Runs on: `http://127.0.0.1:5001`
- Debug mode enabled
- Auto-reload on file changes

### Production
```bash
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

---

## 📝 Example API Calls

### Login Example
```bash
curl -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{
    "role": "hod",
    "password": "password",
    "department": "CSE"
  }'
```

### Create Request Example
```bash
curl -X POST http://localhost:5001/create-hod-request \
  -H "Authorization: Bearer <token>" \
  -F "name=John Doe" \
  -F "event_name=Tech Talk" \
  -F "event_date=2026-02-20" \
  -F "time_in=10:00 AM" \
  -F "time_out=12:00 PM" \
  -F "guest_name=Guest Name" \
  -F "company_detail=Company XYZ" \
  -F "purpose=Lecture" \
  -F "guest_email=guest@email.com" \
  -F "guest_phone=9876543210" \
  -F "hod_id=1" \
  -F "approvalLetter=@approval.pdf" \
  -F "appreciation_letter=@appreciation.pdf" \
  -F "image=@guest.jpg"
```

---

## 🐛 Common Issues & Troubleshooting

### Issue: Database locked
**Solution**: Delete `mysql.db` and restart application

### Issue: Email not sending
**Solution**: Check environment variables, enable Gmail app passwords

### Issue: QR code not generating
**Solution**: Ensure `uploads/` directory exists and has write permissions

### Issue: CORS errors
**Solution**: CORS is enabled by default, check frontend URL

---

## 📊 Statistics & Metrics

The backend tracks:
- Total requests count
- Pending requests count
- Approved requests count
- Request creation timestamps
- Approval timestamps
- Guest check-in/check-out times
- OTP verification status
- Email delivery status

---

## 🎯 Summary

The Gate_Epass backend is a comprehensive Flask application providing:
- ✅ JWT-based authentication and authorization
- ✅ Guest pass request management
- ✅ OTP and QR code generation
- ✅ Guest check-in/check-out tracking
- ✅ Email notifications with attachments
- ✅ File upload and storage management
- ✅ Data export functionality
- ✅ Role-based access control

**Total Endpoints**: 21+
**Database Models**: 4
**Authentication Methods**: JWT + Role-based
**File Handling**: Image uploads, PDF documents, QR codes
**Email Integration**: Gmail SMTP with attachments

