# API Calling Flow & Architecture

## 🎯 Complete Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GUEST PASS SYSTEM FLOW                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 1: REQUEST CREATION                                            │
└─────────────────────────────────────────────────────────────────────┘

HOD/AO Login
    │
    ├─→ POST /login
    │   ├─ Verify credentials
    │   ├─ Generate JWT token
    │   └─ Return user data + token
    │
    └─→ Store token in localStorage
        │
        └─→ All subsequent requests use Authorization header

Create Guest Pass Request
    │
    ├─→ POST /create-hod-request or /create-ao-request
    │   ├─ File uploads (images, PDFs)
    │   ├─ Generate unique request ID
    │   ├─ Create database entry
    │   └─ Return request_id
    │
    └─→ Status: PENDING (awaiting approval)


┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 2: REQUEST APPROVAL                                            │
└─────────────────────────────────────────────────────────────────────┘

Admin/Principal Views Pending Requests
    │
    ├─→ GET /all-requests?status=Pending
    │   ├─ Fetch all pending requests
    │   ├─ Optional: Filter by department/search
    │   └─ Return request list
    │
    └─→ Display in dashboard

Admin Reviews & Approves Request
    │
    ├─→ PUT /requests/<request_id>
    │   ├─ Update status to "Accepted"
    │   ├─ Generate OTP (4-digit random)
    │   ├─ Generate QR code with OTP
    │   ├─ Set approved_time to current datetime
    │   └─ Send OTP + QR code email to guest
    │
    └─→ Status: ACCEPTED


┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 3: GUEST NOTIFICATION                                          │
└─────────────────────────────────────────────────────────────────────┘

Email Sent to Guest
    │
    ├─→ Subject: "Your Event Pass QR Code – KGISL"
    │   ├─ Event details
    │   ├─ KGISL location & contact
    │   ├─ QR code image (embedded with OTP)
    │   └─ Instructions for entry
    │
    └─→ Guest downloads/saves QR code

Guest Receives Confirmation
    │
    └─→ Ready for check-in on event date


┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 4: GUEST ENTRY                                                 │
└─────────────────────────────────────────────────────────────────────┘

Security Personnel Scan QR Code
    │
    ├─→ Extract OTP from QR code
    │   │
    │   └─→ POST /verify-otp
    │       ├─ Look up request by OTP
    │       ├─ Fetch guest details
    │       ├─ Retrieve guest image
    │       └─ Return guest information
    │
    └─→ Verify guest identity (using photo)

Guest Checks In
    │
    ├─→ POST /update-time
    │   ├─ body: { "otp": "1234", "action": "arrived" }
    │   ├─ Validate: current_time >= scheduled time_in
    │   ├─ Record actual check-in time
    │   └─ Update Actual_intime field
    │
    └─→ Status: CHECKED IN


┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 5: ACTIVE TRACKING                                             │
└─────────────────────────────────────────────────────────────────────┘

Security Monitor Active Guests
    │
    ├─→ GET /active-requests
    │   ├─ Fetch all guests currently inside
    │   ├─ Filter: Actual_intime != "Not Arrived" 
    │   │         AND Actual_outtime == "Not Arrived"
    │   └─ Display active guests list
    │
    └─→ Track guest in real-time


┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 6: GUEST EXIT                                                  │
└─────────────────────────────────────────────────────────────────────┘

Guest Checks Out
    │
    ├─→ POST /update-time
    │   ├─ body: { "otp": "1234", "action": "left" }
    │   ├─ Record actual check-out time
    │   ├─ Update Actual_outtime field
    │   ├─ Trigger thank-you email
    │   └─ Attach appreciation letter
    │
    └─→ Status: CHECKED OUT

Guest Receives Thank You Email
    │
    └─→ Email with appreciation letter attachment


┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 7: POST-EVENT MANAGEMENT                                       │
└─────────────────────────────────────────────────────────────────────┘

Admin/HOD Review Completed Events
    │
    ├─→ GET /all-requests (with filters)
    │   ├─ View all guest data
    │   ├─ Check-in/check-out times
    │   └─ Event details
    │
    └─→ Export data if needed

Export Request Data
    │
    ├─→ GET /export-requests?status=Accepted&department=CSE
    │   ├─ Filter requests
    │   ├─ Generate CSV file
    │   └─ Download to local machine
    │
    └─→ Data archived
```

---

## 🔄 API Call Sequence Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│   HOD    │         │ Frontend │         │ Backend  │         │ Database │
│(Browser) │         │(React)   │         │(Flask)   │         │(SQLite)  │
└──────────┘         └──────────┘         └──────────┘         └──────────┘
     │                    │                    │                    │
     │─────Login ────────→│                    │                    │
     │                    │─POST /login───────→│                    │
     │                    │                    │──Query HOD────────→│
     │                    │                    │←──HOD data────────│
     │                    │←JWT Token────────│                    │
     │←─────User Data────|                    │                    │
     │                    │ (Store JWT in localStorage)            │
     │                    │                    │                    │
     │─Create Request────→│                    │                    │
     │                    │─POST + Files──────→│                    │
     │                    │                    │──Generate ID──────→│
     │                    │                    │←──ID Generated────│
     │                    │                    │──Save Files & DB──→│
     │                    │                    │←──Saved ──────────│
     │                    │←─request_id───────│                    │
     │←──Success─────────│                    │                    │
     │                    │                    │                    │
     │                    │                    │                    │
     └──────────────────────────────────────────────────────────────┘
                      HOD Request Created ✅


     ┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
     │  Admin   │         │ Frontend │         │ Backend  │         │ Database │
     │(Browser) │         │(React)   │         │(Flask)   │         │(SQLite)  │
     └──────────┘         └──────────┘         └──────────┘         └──────────┘
          │                    │                    │                    │
          │─View Requests─────→│                    │                    │
          │                    │─GET /all-requests→│                    │
          │                    │                    │──Query All───────→│
          │                    │                    │←──Requests───────│
          │                    │←─Request List────│                    │
          │←─Display Table─────│                    │                    │
          │                    │                    │                    │
          │─Approve Request───→│                    │                    │
          │                    │─PUT /requests/id──→│                    │
          │                    │                    │──Generate OTP────→│
          │                    │                    │──Generate QR─────→│
          │                    │                    │──Save QR to disk─→│
          │                    │                    │──Update Status───→│
          │                    │                    │←──Updated────────│
          │                    │                    │──Send Email──────→
          │                    │                    │  (SMTP Connection)
          │                    │←─Success─────────│                    │
          │←─Approval Done─────│                    │                    │
          │                    │                    │                    │

     ┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
     │  Guest   │         │ Frontend │         │ Backend  │         │ Database │
     │(Mobile)  │         │(React)   │         │(Flask)   │         │(SQLite)  │
     └──────────┘         └──────────┘         └──────────┘         └──────────┘
          │                    │                    │                    │
          │←──Receives Email with QR code ──────────────────────────────│
          │                    │                    │                    │
          │─Scans QR Code─────→│                    │                    │
          │(Contains OTP)       │─POST /verify-otp─→│                    │
          │                    │                    │──Query by OTP────→│
          │                    │                    │←──Request Data───│
          │                    │←─Guest Details───│                    │
          │←─Display Info──────│(name, image, etc) │                    │
          │                    │                    │                    │
          │─Click "Arrived"───→│                    │                    │
          │                    │─POST /update-time→│                    │
          │                    │ action: "arrived" │──Update time─────→│
          │                    │                    │←──Confirmed──────│
          │                    │←─Checked In───────│                    │
          │←─Entry Allowed─────│                    │                    │
          │                    │                    │                    │
          │ ... Guest inside campus ...             │                    │
          │                    │                    │                    │
          │─Click "Left"──────→│                    │                    │
          │                    │─POST /update-time→│                    │
          │                    │ action: "left"    │──Update time─────→│
          │                    │                    │──Send Email──────→
          │                    │                    │(Thank You + Cert)
          │                    │←─Checked Out──────│                    │
          │←─Exit Confirmed────│                    │                    │
          │                    │                    │                    │
          │←──Receives Email with Appreciation─────────────────────────│
```

---

## 📊 API Endpoint Categories

### 1. Authentication Endpoints (2)
```
POST   /login
PUT    /forgot-password
```

### 2. HOD Management Endpoints (4)
```
GET    /api/hods
POST   /api/create-hod
PUT    /api/update-hod/<hod_id>
DELETE /api/delete-hod/<hod_id>
```

### 3. Request Creation Endpoints (2)
```
POST   /create-hod-request
POST   /create-ao-request
```

### 4. Request Management Endpoints (4)
```
GET    /all-requests
GET    /requests/<hod_id>
PUT    /requests/<request_id>
PUT    /principal-requests/<request_id>
PUT    /requests/<request_id>/remarks
```

### 5. Guest Check-in/out Endpoints (3)
```
POST   /verify-otp
POST   /update-time
GET    /active-requests
```

### 6. Utility Endpoints (5)
```
POST   /add-accompany-persons
GET    /api/departments
GET    /api/stats
GET    /export-requests
GET    /uploads/<filename>
```

**Total: 20+ endpoints**

---

## 🔐 Request Headers Format

### With JWT Authentication
```
GET /all-requests
Host: localhost:5001
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Multipart Form Data (File Upload)
```
POST /create-hod-request
Host: localhost:5001
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=----FormBoundary
```

### JSON Request
```
POST /login
Host: localhost:5001
Content-Type: application/json
Content-Length: 123
```

---

## 📝 Response Status Codes

| Code | Meaning | Example Scenario |
|------|---------|------------------|
| 200 | OK | Request processed successfully |
| 201 | Created | New resource created (request/HOD) |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid credentials or missing token |
| 403 | Forbidden | Insufficient permissions (wrong role) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database error, file system error |

---

## 🌐 CORS Configuration

```
Origin: http://localhost:3000 ✅ Allowed
Methods: GET, POST, PUT, DELETE, OPTIONS ✅ Allowed
Headers: Authorization, Content-Type ✅ Allowed
Credentials: Supported ✅
```

---

## 💾 Database Transaction Flow

```
User Request
    │
    └─→ Flask receives HTTP request
         │
         ├─→ Parse request data
         ├─→ Validate input
         ├─→ Check authentication (if needed)
         │
         └─→ Execute business logic
              │
              ├─→ Query database (Session Read)
              ├─→ Modify data (Session Write)
              ├─→ db.session.add() or db.session.update()
              │
              └─→ db.session.commit()
                   │
                   ├─→ Transaction committed to SQLite
                   ├─→ Changes persist
                   │
                   └─→ Return response to client
```

---

## 📧 Email Integration Flow

```
Admin Approves Request
    │
    ├─→ Generate OTP
    ├─→ Create QR Code (contains OTP)
    ├─→ Save QR image to disk
    │
    └─→ send_otp_email()
         │
         ├─→ Create MIME message
         ├─→ Attach QR code image
         │
         └─→ SMTP Connection (Gmail)
              │
              ├─→ server.starttls() - Encrypt connection
              ├─→ server.login() - Authenticate
              ├─→ server.sendmail() - Send email
              │
              └─→ Connection closed


Guest Checks Out
    │
    └─→ send_thankyou_email()
         │
         ├─→ Create MIME message
         ├─→ Find latest appreciation letter
         ├─→ Attach PDF file
         │
         └─→ SMTP Connection (Gmail)
              │
              ├─→ Encrypt & Authenticate
              ├─→ Send with attachment
              │
              └─→ Email delivered ✅
```

---

## 🛡️ Security Flow

```
User Login Request
    │
    └─→ Backend receives: { role, password, department }
         │
         ├─→ Fetch HOD from database by department
         ├─→ Compare provided password with hashed password
         │   (using Werkzeug check_password_hash)
         │
         ├─→ If match:
         │   └─→ Create JWT token with user data
         │       - user_id, role, name, exp time
         │       - Signed with SECRET_KEY
         │
         └─→ Return token to client
             │
             └─→ Client stores in localStorage
                  │
                  └─→ Uses in Authorization header for protected routes


Protected Route Access
    │
    └─→ Client sends: Authorization: Bearer <token>
         │
         └─→ @token_required decorator:
              │
              ├─→ Extract token from header
              ├─→ Verify signature (jwt.decode)
              ├─→ Check expiration
              │
              ├─→ If valid:
              │   └─→ Attach user_data to request
              │       └─→ Allow route execution
              │
              └─→ If invalid:
                  └─→ Return 401 Unauthorized


Role-Based Access
    │
    └─→ @role_required(['admin']) decorator:
         │
         ├─→ Extract token
         ├─→ Decode token
         │
         └─→ Check if user.role in allowed_roles
              │
              ├─→ If yes:
              │   └─→ Allow route execution
              │
              └─→ If no:
                  └─→ Return 403 Forbidden
```

---

## 🔄 Real-Time Updates

### Guest Tracking (Active Guests)
```
Admin Dashboard (Polling every 10 seconds)
    │
    └─→ GET /active-requests
         │
         └─→ Query: 
             WHERE Actual_intime != "Not Arrived" 
             AND Actual_outtime == "Not Arrived"
         │
         └─→ Display updated list of guests currently inside
```

---

## 📊 Data Consistency

```
Request Creation:
    ├─→ Generate Unique ID (prevent duplicates)
    ├─→ Save files to disk
    ├─→ Save record to database
    └─→ Ensure atomic operation (commit or rollback)

Request Approval:
    ├─→ Update status
    ├─→ Generate OTP
    ├─→ Create QR code
    ├─→ Save to database
    ├─→ Send email (may fail - async consideration)
    └─→ Return success

Guest Check-in:
    ├─→ Verify OTP exists
    ├─→ Validate time constraints
    ├─→ Update Actual_intime
    ├─→ Commit transaction
    └─→ Return confirmation
```

---

## 🎯 Summary Table

| Phase | Endpoint | Method | Purpose | Role |
|-------|----------|--------|---------|------|
| 1 | /login | POST | Authenticate user | HOD/AO/Admin |
| 2 | /create-hod-request | POST | Create guest pass | HOD |
| 3 | /all-requests | GET | View requests | Admin/Principal |
| 4 | /requests/{id} | PUT | Approve/Reject | Admin |
| 5 | (Email Sent) | - | QR Code + OTP | Guest |
| 6 | /verify-otp | POST | Verify guest | Security |
| 7 | /update-time | POST | Check-in/Check-out | Security/Guest |
| 8 | /active-requests | GET | Monitor guests | Security |
| 9 | /export-requests | GET | Data export | Admin |
| 10 | (Email Sent) | - | Thank you letter | Guest |

