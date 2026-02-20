# 🔍 LOGIN TROUBLESHOOTING GUIDE

## Issue: Credentials Not Routing to Backend

Let's systematically check each part:

---

## ✅ Step 1: Verify Backend is Receiving Requests

### Check Backend Terminal
Look for these logs when you try to login:

```
127.0.0.1 - - [20/Feb/2026 10:56:57] "OPTIONS /login HTTP/1.1" 200 -
127.0.0.1 - - [20/Feb/2026 10:56:58] "POST /login HTTP/1.1" 200 -
```

**If you see these**: Backend is receiving requests ✅
**If you DON'T see these**: Frontend isn't sending requests to backend ❌

---

## ✅ Step 2: Check Frontend Console (F12)

### Open Browser DevTools
1. Press: `F12`
2. Click: **Console** tab
3. Try logging in
4. Look for:

### What to look for:

**Good signs:**
```
POST http://127.0.0.1:5001/login 200 (or 201)
```

**Bad signs (errors):**
```
XMLHttpRequest cannot load http://127.0.0.1:5001/login
CORS error
Failed to fetch
Connection refused
```

---

## ✅ Step 3: Check Network Tab

1. Press: `F12`
2. Click: **Network** tab
3. Try logging in
4. Look for a request named: `login`
5. Click on it and check:

### Request Tab
- **URL**: Should be `http://127.0.0.1:5001/login`
- **Method**: Should be `POST`
- **Request Body**: Should show your login data
  ```json
  {
    "role": "hod",
    "password": "yourpassword",
    "department": "yourdepartment"
  }
  ```

### Response Tab
- Should show: `{"message": "Login successful", "token": "...", "user": {...}}`

---

## 🔧 Common Issues & Fixes

### Issue 1: CORS Error
```
Access to XMLHttpRequest... blocked by CORS policy
```

**Fix:**
1. Check backend `.env`:
   ```
   FRONTEND_URL=http://localhost:3000
   FRONTEND_URL_ALT=http://127.0.0.1:3000
   ```
2. Check backend `app.py` CORS config loads from env
3. Restart backend

---

### Issue 2: Network Request Not Being Sent
**Console shows no network activity**

**Fix:**
1. Check frontend `.env.local`:
   ```
   REACT_APP_API_URL=http://127.0.0.1:5001
   ```
2. Restart frontend: `npm start`
3. Check console logs to verify:
   ```javascript
   console.log(process.env.REACT_APP_API_URL)
   // Should output: http://127.0.0.1:5001
   ```

---

### Issue 3: Backend Not Receiving POST (Only OPTIONS)
**Backend logs show only OPTIONS requests, no POST**

**This is actually normal** - CORS does a preflight OPTIONS check first, then sends POST.

But if you see OPTIONS 200 followed by nothing, the POST might be blocked.

**Fix:**
1. Check backend CORS settings
2. Ensure `"supports_credentials": True` in CORS config
3. Verify allowed methods include POST

---

## 🚀 Complete Debugging Checklist

```
Frontend .env.local:
  [ ] REACT_APP_API_URL=http://127.0.0.1:5001
  [ ] REACT_APP_BACKEND_URL=http://127.0.0.1:5001

Backend .env:
  [ ] BACKEND_URL=http://127.0.0.1:5001
  [ ] FRONTEND_URL=http://localhost:3000
  [ ] FRONTEND_URL_ALT=http://127.0.0.1:3000
  [ ] FLASK_ENV=development
  [ ] DEBUG=True

Backend Running:
  [ ] Terminal shows: "Running on http://127.0.0.1:5001"
  [ ] No errors in terminal

Frontend Running:
  [ ] Terminal shows: "webpack compiled..."
  [ ] Browser shows: http://localhost:3000

Test Login:
  [ ] Press F12 in browser
  [ ] Go to Console tab
  [ ] Try to login
  [ ] Look for POST request to /login
  [ ] Check response status is 200
  [ ] No CORS errors shown
```

---

## 🔍 Advanced Debug: Check API URL at Runtime

In browser console, paste this:
```javascript
console.log("API URL:", process.env.REACT_APP_API_URL);
console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL);
```

This will show what your frontend is actually using.

---

## 📝 What to Tell Me If It's Still Not Working

When reporting the issue, please provide:

1. **Backend terminal output** (when you try to login):
   - Do you see `OPTIONS /login`?
   - Do you see `POST /login`?
   - Any errors?

2. **Frontend console (F12 → Console)**:
   - Any error messages?
   - What does `console.log(process.env.REACT_APP_API_URL)` show?

3. **Network tab (F12 → Network)**:
   - Do you see a `login` request?
   - What's the status code?
   - What's in the response?

4. **Files content**:
   - What's in `backend/.env` (BACKEND_URL, FRONTEND_URL)?
   - What's in `frontend/.env.local` (REACT_APP_API_URL)?

---

## 🎯 Most Common Fix

99% of the time, the issue is:
1. ❌ Frontend not restarted after changing `.env.local`
2. ❌ Backend `.env` has wrong URLs
3. ❌ Backend not restarted after changing `.env`

**Solution:**
```bash
# 1. Kill everything (Ctrl+C in both terminals)
# 2. Update .env files
# 3. Restart both:

# Terminal 1 - Backend
cd backend && source venv/bin/activate && python app.py

# Terminal 2 - Frontend
cd frontend && npm start

# 4. Try login again
```

---

**Let me know what you see in the backend terminal and browser console!** 🚀
