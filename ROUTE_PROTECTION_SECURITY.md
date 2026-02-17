# URL Access Control & Route Protection - Security Implementation

## 🔒 Problem Solved
**Issue:** Users could change URLs in the address bar and access protected pages without authentication (e.g., `/admin`, `/hod-home`) bypassing login.

**Solution:** Implemented comprehensive route protection with JWT authentication on both frontend and backend.

---

## ✅ Implementation Details

### **1. Frontend Route Protection** 

#### New Components Created:
- `ProtectedRoute.js` - Component that guards all protected routes
- `Unauthorized.js` - Shows access denied page for unauthorized users

#### How it works:
```javascript
// Protected routes now require authentication
<Route path="/admin" 
  element={<ProtectedRoute 
    element={<AdminPage />} 
    user={user} 
    allowedRoles={["admin"]} 
  />} 
/>
```

**Features:**
- ✅ Checks if user is logged in before allowing access
- ✅ Checks user role matches allowed roles
- ✅ Redirects to login (`/`) if not authenticated
- ✅ Redirects to `/unauthorized` if role doesn't match

### **2. Backend JWT Authentication**

#### Token Generation on Login
```python
@app.route('/login', methods=['POST'])
def login():
    # ... validation ...
    user_data = {"id": hod.id, "name": hod.name, "role": "hod"}
    token = generate_token(user_data)  # Generate JWT token
    return jsonify({
        "message": "Login successful", 
        "user": user_data, 
        "token": token  # 🔐 Token returned to frontend
    })
```

#### Token Verification Decorators
```python
@token_required  # Protects route - requires valid token
def protected_endpoint():
    # Access request.user_data for user info
    pass

@role_required(['admin', 'hod'])  # Only specific roles allowed
def admin_only_endpoint():
    pass
```

### **3. Frontend API Configuration**

#### Token Storage & Auto-Injection
```javascript
// Token stored in localStorage after login
localStorage.setItem("token", response.data.token);

// Automatically added to all API requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-logout if token expires (401 response)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";  // Redirect to login
        }
    }
);
```

### **4. Session Persistence**

On app load, user session is restored from localStorage:
```javascript
useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
}, []);
```

This allows users to refresh the page without losing their session.

---

## 🔐 Security Features

| Feature | Before | After |
|---------|--------|-------|
| **URL Access** | Anyone could access any URL | Protected routes require login & correct role |
| **Session Management** | No session management | JWT tokens with 24-hour expiration |
| **Page Refresh** | Lost login state | Session restored from localStorage |
| **Unauthorized Access Redirect** | None | Auto-redirect to login page |
| **API Endpoints** | Unprotected | All require valid JWT token |
| **Token Expiry** | N/A | Auto-logout when token expires |

---

## 🚀 How to Test Security

### Test 1: Try Accessing Protected URL Directly
```
1. Without logging in, visit http://localhost:3000/admin
2. Should redirect to login page automatically
```

### Test 2: Check Token in API Calls
```
1. Login as Admin
2. Open DevTools → Network tab
3. Make any API request
4. See Authorization header: "Bearer eyJhbGci..."
```

### Test 3: Try Accessing with Invalid Token
```
1. Login and get token
2. Manually edit token in localStorage
3. Try making API call
4. Should get 401 Unauthorized error
5. Auto-redirects to login
```

### Test 4: Role-Based Access
```
1. Login as HOD
2. Try to access /admin (role=admin required)
3. Should see "Access Denied" page
```

### Test 5: Session Persistence
```
1. Login as any user
2. Refresh the page
3. Should still be logged in (session restored)
4. Close browser and reopen
5. Session persists (token in localStorage)
```

---

## 📝 Protected Routes by Role

| Route | Required Role | Component |
|-------|---------------|-----------|
| `/hod-home` | hod | HodHome |
| `/all-requests` | ao | AllRequests |
| `/admin/*` | admin | AdminPage |
| `/security` | security | Security |
| `/principal-home` | principal, director | PrincipalRequests |
| `/` | anyone | Login (public) |

---

## 🔑 JWT Token Structure

```javascript
{
    "user_id": 1,
    "role": "hod",
    "name": "HODCSE",
    "exp": 1708201203,  // Expiration timestamp
    "iat": 1708114803   // Issued at timestamp
}
```

**Token Expiration:** 24 hours (configurable in `app.config['JWT_EXPIRATION_HOURS']`)

---

## ⚙️ Configuration

### Backend (`app.py`)
```python
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_EXPIRATION_HOURS'] = 24
```

### Update `.env` (Create from `.env.example`)
```
SECRET_KEY=your-secret-key-generate-a-random-string
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 🔄 Logout Implementation

To add logout functionality to your app:
```javascript
const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
};
```

---

## ✨ Files Modified/Created

### New Files
- `frontend/src/components/ProtectedRoute.js` - Route guard component
- `frontend/src/components/Unauthorized.js` - Unauthorized page
- `backend/requirements.txt` - Added PyJWT library

### Modified Files
- `frontend/src/App.js` - Added route protection & session restoration
- `frontend/src/api.js` - Added JWT token interceptor
- `frontend/src/components/Login.js` - Store token in localStorage
- `backend/app.py` - Added JWT authentication & decorators
- `backend/.env.example` - Added SECRET_KEY configuration

---

## ⚠️ Important Notes

1. **Never hardcode SECRET_KEY in production** - Use environment variables
2. **Keep token in localStorage only** - Not in cookies (unless HttpOnly)
3. **Clear token on logout** - Always remove from storage
4. **Regenerate SECRET_KEY regularly** - For high-security applications
5. **Use HTTPS in production** - Tokens should be sent over encrypted connections

---

## Testing the Implementation

To test the complete security setup:

```bash
# 1. Start backend
cd backend && python app.py

# 2. Start frontend  
cd frontend && npm run client

# 3. Test routes
- Try accessing /admin without login → redirected to /
- Login as HOD → can access /hod-home
- Try accessing /admin as HOD → "Access Denied"
- Refresh page → session persists
- Wait 24+ hours → token expires, auto-logout
```

---

## Summary

✅ URL access is now fully controlled by authentication state  
✅ Unauthorized users cannot access protected routes  
✅ Sessions persist across page refreshes  
✅ Expired tokens trigger automatic logout  
✅ Role-based access control prevents privilege escalation  
✅ All API endpoints are protected with JWT tokens
