# 🚀 ENVIRONMENT VARIABLES FOR PRODUCTION DEPLOYMENT

## Quick Reference Table

| Platform | Variable Name | Value | Purpose |
|----------|---------------|-------|---------|
| **RENDER** (Backend) | `BACKEND_URL` | `https://gate-epass-w82j.onrender.com` | Backend server URL for image paths |
| **RENDER** (Backend) | `FRONTEND_URL` | `https://gatepass-rho.vercel.app` | Frontend URL for CORS |
| **RENDER** (Backend) | `FRONTEND_URL_ALT` | `http://127.0.0.1:3000` | Alternative frontend URL for local testing |
| **RENDER** (Backend) | `SECRET_KEY` | `arunaw` | JWT secret key |
| **RENDER** (Backend) | `MAIL_USERNAME` | `infotechcheb@gmail.com` | Email address to send notifications |
| **RENDER** (Backend) | `MAIL_PASSWORD` | `wzxk axwa iifa iplk` | Email app password |
| **RENDER** (Backend) | `DATABASE_URL` | `sqlite:///mysql.db` | Database connection (SQLite) |
| **RENDER** (Backend) | `FLASK_ENV` | `production` | Flask environment |
| **RENDER** (Backend) | `DEBUG` | `False` | Debug mode off for production |
| **VERCEL** (Frontend) | `REACT_APP_API_URL` | `https://gate-epass-w82j.onrender.com` | Backend API URL |
| **VERCEL** (Frontend) | `REACT_APP_BACKEND_URL` | `https://gate-epass-w82j.onrender.com` | Backend URL (alternative name) |

---

## 📝 Step-by-Step: RENDER Backend Setup

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your service: **gate-epass-w82j** (Backend)

### Step 2: Navigate to Environment Variables
1. Click **Settings** (in the top menu)
2. Scroll down to find **Environment** section
3. Click **Add Environment Variable** button

### Step 3: Add Each Variable

Add these variables **exactly as shown**:

#### Variable 1: BACKEND_URL
```
Name:  BACKEND_URL
Value: https://gate-epass-w82j.onrender.com
```

#### Variable 2: FRONTEND_URL
```
Name:  FRONTEND_URL
Value: https://gatepass-rho.vercel.app
```

#### Variable 3: FRONTEND_URL_ALT
```
Name:  FRONTEND_URL_ALT
Value: http://127.0.0.1:3000
```

#### Variable 4: SECRET_KEY
```
Name:  SECRET_KEY
Value: arunaw
```

#### Variable 5: MAIL_USERNAME
```
Name:  MAIL_USERNAME
Value: infotechcheb@gmail.com
```

#### Variable 6: MAIL_PASSWORD
```
Name:  MAIL_PASSWORD
Value: wzxk axwa iifa iplk
```

#### Variable 7: DATABASE_URL
```
Name:  DATABASE_URL
Value: sqlite:///mysql.db
```

#### Variable 8: FLASK_ENV
```
Name:  FLASK_ENV
Value: production
```

#### Variable 9: DEBUG
```
Name:  DEBUG
Value: False
```

### Step 4: Save and Redeploy
1. After adding all variables, click **Save** button
2. Render will automatically redeploy your service
3. Wait for deployment to complete (check status in Deployments tab)

---

## 📝 Step-by-Step: VERCEL Frontend Setup

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com
2. Select your project: **gatepass** (Frontend)

### Step 2: Navigate to Environment Variables
1. Click **Settings** (in the top menu)
2. Click **Environment Variables** (in the left sidebar)

### Step 3: Add Each Variable

Add these variables **exactly as shown**:

#### Variable 1: REACT_APP_API_URL
```
Name:  REACT_APP_API_URL
Value: https://gate-epass-w82j.onrender.com
```

#### Variable 2: REACT_APP_BACKEND_URL
```
Name:  REACT_APP_BACKEND_URL
Value: https://gate-epass-w82j.onrender.com
```

### Step 4: Select Environment Scope
- For each variable, make sure it's enabled for:
  - ✅ Production
  - ✅ Preview
  - ✅ Development (optional, but good for testing)

### Step 5: Save and Redeploy
1. Variables are saved automatically
2. Go to **Deployments** tab
3. Find your latest deployment
4. Click the **...** menu → **Redeploy** button
5. Select **Redeploy** again to confirm
6. Wait for the new deployment to complete

---

## 🔍 Verification Checklist

### After Setting Variables in Render

✅ Backend loads the environment variables:
```bash
# SSH into Render (in Render dashboard)
# Or check the logs
env | grep BACKEND_URL
env | grep FRONTEND_URL
```

✅ CORS is working:
- Visit https://gatepass-rho.vercel.app
- Open browser DevTools Console
- Check if API calls are working (no CORS errors)

✅ Images are loading:
- Request guest data from API
- Check if image URLs are: `https://gate-epass-w82j.onrender.com/uploads/...`

### After Setting Variables in Vercel

✅ Frontend loads the environment variables:
1. Visit https://gatepass-rho.vercel.app
2. Open browser DevTools Console
3. Type: `console.log(process.env.REACT_APP_API_URL)`
4. Should show: `https://gate-epass-w82j.onrender.com`

✅ API calls are working:
- Try logging in
- Try viewing requests
- Check network tab for successful API calls
- No 404 or CORS errors

---

## 🔄 What These Variables Do

### Backend (Render)

**BACKEND_URL** 
- Used to construct image URLs when API returns guest data
- Example: `https://gate-epass-w82j.onrender.com/uploads/photo.jpg`

**FRONTEND_URL** 
- Tells backend which URLs are allowed to make requests (CORS)
- Frontend at `https://gatepass-rho.vercel.app` will be allowed

**FRONTEND_URL_ALT** 
- Alternative allowed URL for local testing
- Allows `http://127.0.0.1:3000` (your local frontend)

**SECRET_KEY** 
- Used to sign JWT tokens for login/authentication
- Keep this secret!

**MAIL_USERNAME** & **MAIL_PASSWORD** 
- Credentials to send emails from
- Used for email notifications

**DATABASE_URL** 
- SQLite database file path
- Currently: `sqlite:///mysql.db`

**FLASK_ENV** 
- Set to `production` for live deployment
- Disables debug mode

**DEBUG** 
- Set to `False` for production (security)

### Frontend (Vercel)

**REACT_APP_API_URL** 
- Base URL for all API calls
- Frontend will use: `https://gate-epass-w82j.onrender.com/api/...`

**REACT_APP_BACKEND_URL** 
- Alternative name for backend URL
- Same as above, just for flexibility

---

## ⚠️ Important Notes

### For Render Backend:
1. **FLASK_ENV**: Should be `production` (not `development`)
2. **DEBUG**: Should be `False` (not `True`)
3. **BACKEND_URL**: Must match your actual Render URL: `https://gate-epass-w82j.onrender.com`
4. **FRONTEND_URL**: Must match your actual Vercel URL: `https://gatepass-rho.vercel.app`

### For Vercel Frontend:
1. **Variables must start with `REACT_APP_`** to be available in browser
2. Both `REACT_APP_API_URL` and `REACT_APP_BACKEND_URL` should have the same value
3. After adding variables, **REDEPLOY** the project for changes to take effect
4. Check "Production" scope is enabled

---

## 🚨 Troubleshooting

### "CORS Error" - Request from frontend blocked
**Solution**: Check Render environment variables
- ✅ `FRONTEND_URL` is set to `https://gatepass-rho.vercel.app`
- ✅ Redeploy after changing variables

### "Cannot fetch data" - 404 or connection error
**Solution**: Check Vercel environment variables
- ✅ `REACT_APP_API_URL` is set to `https://gate-epass-w82j.onrender.com`
- ✅ Redeploy after changing variables

### "Images not loading"
**Solution**: Check both are working together
- ✅ Backend `BACKEND_URL` = `https://gate-epass-w82j.onrender.com`
- ✅ Check image path in API response

### "Variables not updating"
**Solution**: Redeploy after changing
- Render: Click "Deploy" or "Redeploy" button
- Vercel: Go to Deployments → Click "..." → Redeploy

---

## 📋 Copy-Paste Commands

### List of all variables to copy (for reference)

**RENDER Backend:**
```
BACKEND_URL = https://gate-epass-w82j.onrender.com
FRONTEND_URL = https://gatepass-rho.vercel.app
FRONTEND_URL_ALT = http://127.0.0.1:3000
SECRET_KEY = arunaw
MAIL_USERNAME = infotechcheb@gmail.com
MAIL_PASSWORD = wzxk axwa iifa iplk
DATABASE_URL = sqlite:///mysql.db
FLASK_ENV = production
DEBUG = False
```

**VERCEL Frontend:**
```
REACT_APP_API_URL = https://gate-epass-w82j.onrender.com
REACT_APP_BACKEND_URL = https://gate-epass-w82j.onrender.com
```

---

## ✅ Final Checklist Before Going Live

- [ ] All 9 variables added to Render backend
- [ ] `FLASK_ENV` is set to `production` (not development)
- [ ] `DEBUG` is set to `False` (not True)
- [ ] `FRONTEND_URL` is set to your Vercel URL
- [ ] All 2 variables added to Vercel frontend
- [ ] Both `REACT_APP_*` variables use Render URL
- [ ] Render service has been redeployed
- [ ] Vercel project has been redeployed
- [ ] Backend is responding at `https://gate-epass-w82j.onrender.com/api/...`
- [ ] Frontend is loading at `https://gatepass-rho.vercel.app`
- [ ] No CORS errors in console
- [ ] API calls are working
- [ ] Images are loading correctly

---

## 🎯 Summary

**Render** needs 9 variables for your backend to work correctly with:
- Image URLs pointing to backend
- CORS allowing frontend requests
- JWT tokens for authentication
- Email sending
- Database connection

**Vercel** needs 2 variables for your frontend to:
- Know where to send API requests (backend URL)

After setting these, your application will be **100% configurable** for production without any code changes! 🎉
