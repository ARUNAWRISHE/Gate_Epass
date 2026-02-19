# 🔍 Where Environment Variables Are Used in Code

## Backend Usage (app.py)

### 1️⃣ CORS Configuration (Lines 28-34)
**File**: `backend/app.py`

```python
# 🔐 CORS Configuration - Allow Frontend (from environment variables)
allowed_origins = [
    os.getenv('FRONTEND_URL', 'http://localhost:3000'),
    os.getenv('FRONTEND_URL_ALT', 'http://127.0.0.1:3000'),
    'https://gatepass-rho.vercel.app',  # Production frontend
]

CORS(app, resources={
    r"/*": {
        "origins": allowed_origins,
        ...
    }
})
```

**What it does**: 
- Reads `FRONTEND_URL` from `backend/.env`
- Reads `FRONTEND_URL_ALT` from `backend/.env`
- Allows these URLs to make requests to the backend (CORS)
- Falls back to localhost if env variables aren't set

**Environment Variables Used**:
- `FRONTEND_URL` = The frontend URL that will make API requests
- `FRONTEND_URL_ALT` = Alternative frontend URL for development

---

### 2️⃣ JWT Configuration (Lines 44-47)
**File**: `backend/app.py`

```python
# 🔐 JWT Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_EXPIRATION_HOURS'] = 24
```

**What it does**:
- Reads `SECRET_KEY` from `backend/.env` for token encryption
- Used for login/authentication tokens

**Environment Variables Used**:
- `SECRET_KEY` = Secret key for JWT token generation

---

### 3️⃣ Email Configuration (Lines 55-61)
**File**: `backend/app.py`

```python
# Email Configuration
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'your-email@example.com')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'your-email-password')
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
```

**What it does**:
- Reads email credentials from `backend/.env`
- Used for sending email notifications

**Environment Variables Used**:
- `MAIL_USERNAME` = Email address to send from
- `MAIL_PASSWORD` = Email app password

---

### 4️⃣ Database Configuration (Lines 64-67)
**File**: `backend/app.py`

```python
# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///mysql.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
```

**What it does**:
- Reads database URL from `backend/.env`
- Currently using SQLite

**Environment Variables Used**:
- `DATABASE_URL` = Database connection string

---

### 5️⃣ Image URLs for Guests (Line ~907)
**File**: `backend/app.py` (inside a route)

```python
# Generate guest image URL using backend URL from environment
backend_url = os.getenv('BACKEND_URL', 'https://gate-epass-w82j.onrender.com')
guest_image_url = f"{backend_url}/uploads/{request_obj.image}"
```

**What it does**:
- When API returns guest data with an image, it constructs the full image URL
- Uses `BACKEND_URL` to ensure images load from the correct server
- Works for both local and production environments

**Environment Variables Used**:
- `BACKEND_URL` = Backend server URL (for constructing image paths)

---

## Frontend Usage (JavaScript Components)

### 1️⃣ API Configuration File (api.js)
**File**: `frontend/src/api.js`

```javascript
import axios from 'axios';

// ✅ Already using environment variable!
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
```

**What it does**:
- Creates axios instance with base URL from `REACT_APP_API_URL`
- All API calls through this wrapper automatically use the correct URL
- Falls back to localhost if env variable isn't set

**Environment Variables Used**:
- `REACT_APP_API_URL` = Backend API base URL

**Components Using This**:
- Any component that imports and uses `api` from `api.js`
- Example: `api.get('/all-requests')`

---

### 2️⃣ Components Using Hardcoded URLs (⚠️ Not Using Env Variables)
**File**: `frontend/src/components/*.js`

These components make direct axios calls with hardcoded URLs:

```javascript
// ❌ HARDCODED (not using environment variable)
const response = await axios.get("http://127.0.0.1:5001/all-requests", {...})
```

**Components affected**:
- `AllRequests.js` (6 instances)
- `PrincipalRequests.js` (5 instances)
- `Security.js` (4 instances)
- `AddHodAndShowHodsPage.js` (4 instances)
- `Adminlog.js` (3 instances)
- `CreateRequestPopup.js` (2 instances)
- Others (1 instance each)

**Recommended Fix**:
Change these to use the env variable:
```javascript
// ✅ USING ENVIRONMENT VARIABLE
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001';
const response = await axios.get(`${API_URL}/all-requests`, {...})
```

Or better yet, use the `api.js` wrapper:
```javascript
// ✅ BEST: Using API wrapper
import api from '../api';
const response = await api.get('/all-requests');
```

---

## Environment Variables Matrix

### What Each .env File Contains

| File | Purpose | Variables | Used By |
|------|---------|-----------|---------|
| `backend/.env` | Backend configuration | `BACKEND_URL`, `FRONTEND_URL`, `FRONTEND_URL_ALT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `SECRET_KEY`, `DATABASE_URL` | Backend (app.py) |
| `frontend/.env.local` | Frontend local dev config | `REACT_APP_API_URL`, `REACT_APP_BACKEND_URL` | Frontend (npm start) |
| `frontend/.env.production` | Frontend production config | `REACT_APP_API_URL`, `REACT_APP_BACKEND_URL` | Frontend (npm run build) |

---

## When Each .env File Is Used

### Backend
- **Always uses**: `backend/.env` (from working directory when app starts)
- **Default values**: Fallback values in `os.getenv()` calls
- **Deployment**: Environment variables set in Render dashboard override `backend/.env`

### Frontend Local Development
```bash
npm start  # ← Uses frontend/.env.local
```

### Frontend Production Build
```bash
npm run build  # ← Uses frontend/.env.production
```

---

## 🔄 Environment Variable Flow

### Local Development Flow
```
1. Developer runs: npm start (frontend) + python app.py (backend)
   ↓
2. Frontend loads frontend/.env.local
   - REACT_APP_API_URL = http://127.0.0.1:5001
   ↓
3. Frontend makes API call to: http://127.0.0.1:5001/api/...
   ↓
4. Backend receives request
   ↓
5. Backend checks backend/.env
   - FRONTEND_URL = http://localhost:3000
   - Verifies request is from allowed origin
   ↓
6. Request allowed (CORS passes)
   ↓
7. Backend returns response with image URLs:
   - BACKEND_URL = http://127.0.0.1:5001
   - Image URL: http://127.0.0.1:5001/uploads/xyz.jpg
   ↓
8. Frontend displays image from http://127.0.0.1:5001/uploads/xyz.jpg
```

### Production Deployment Flow
```
1. Developer pushes code to GitHub
   ↓
2. GitHub triggers Render (backend) deployment
   - Render sets environment variables from dashboard
   - BACKEND_URL = https://gate-epass-w82j.onrender.com
   - FRONTEND_URL = https://gatepass-rho.vercel.app
   ↓
3. GitHub triggers Vercel (frontend) deployment
   - Vercel builds with frontend/.env.production
   - REACT_APP_API_URL = https://gate-epass-w82j.onrender.com
   ↓
4. User visits: https://gatepass-rho.vercel.app
   ↓
5. Frontend makes API call to: https://gate-epass-w82j.onrender.com/api/...
   ↓
6. Backend receives request
   ↓
7. Backend checks environment variables from Render dashboard
   - FRONTEND_URL = https://gatepass-rho.vercel.app
   - Verifies request is from allowed origin
   ↓
8. Request allowed (CORS passes)
   ↓
9. Backend returns response with image URLs from BACKEND_URL
   ↓
10. Frontend displays images from production backend
```

---

## 📝 Complete List of Env Variables

### Backend (`backend/.env`)
```bash
MAIL_USERNAME=         # Email to send from
MAIL_PASSWORD=         # Email app password
SECRET_KEY=            # JWT secret key
FLASK_ENV=             # Flask environment (development/production)
DEBUG=                 # Debug mode (True/False)
DATABASE_URL=          # Database connection string
BACKEND_URL=           # Backend server URL (for image URLs)
FRONTEND_URL=          # Frontend URL (for CORS)
FRONTEND_URL_ALT=      # Alternative frontend URL (for CORS)
```

### Frontend - Local Dev (`frontend/.env.local`)
```bash
REACT_APP_API_URL=     # Backend API base URL (for npm start)
REACT_APP_BACKEND_URL= # Backend URL (alternative name)
```

### Frontend - Production (`frontend/.env.production`)
```bash
REACT_APP_API_URL=     # Backend API base URL (for npm run build)
REACT_APP_BACKEND_URL= # Backend URL (alternative name)
```

---

## ✅ Current Implementation Status

| Component | Uses Env Variables | Status |
|-----------|-------------------|--------|
| Backend CORS | ✅ Yes | Fully configured |
| Backend Image URLs | ✅ Yes | Fully configured |
| Backend Email | ✅ Yes | Fully configured |
| Backend JWT | ✅ Yes | Fully configured |
| Frontend api.js wrapper | ✅ Yes | Fully configured |
| Frontend direct axios calls | ❌ No | Uses hardcoded URLs (27 instances) |

---

## 🎯 To Complete 100% Implementation

The remaining work is to update the 27 frontend components that use hardcoded URLs. Each would need to be changed from:

```javascript
// ❌ OLD (Hardcoded)
axios.get("http://127.0.0.1:5001/all-requests")
```

To:

```javascript
// ✅ NEW (Using environment variable)
import api from '../api';
api.get('/all-requests')
```

Or:

```javascript
// ✅ Alternative
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001';
axios.get(`${API_URL}/all-requests`)
```

This would make your application **100% configurable** with zero hardcoded URLs anywhere in the codebase.
