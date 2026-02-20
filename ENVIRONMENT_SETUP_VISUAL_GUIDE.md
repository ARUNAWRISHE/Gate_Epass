# 📸 VISUAL GUIDE: Setting Environment Variables

## RENDER BACKEND - Step by Step with Screenshots

### 🔗 Step 1: Open Render Dashboard
**URL**: https://dashboard.render.com

```
1. Click on "Services" (left sidebar)
2. Select "gate-epass-w82j" (your backend service)
```

---

### ⚙️ Step 2: Go to Settings
```
At the top of your service page, you should see tabs:
[Overview] [Metrics] [Settings] [Deployments]

Click: Settings
```

---

### 📋 Step 3: Find Environment Variables Section
```
Scroll down on Settings page until you see:

┌─────────────────────────────────────┐
│ Environment                          │
│ Add your environment variables here  │
│                                      │
│ [+ Add Environment Variable] button   │
└─────────────────────────────────────┘
```

---

### ✏️ Step 4: Add Variables One by One

**Each variable follows this pattern:**
```
┌────────────────────────────────────┐
│ Name: [_____________________]      │
│ Value: [___________________]       │
│ [Save Variable] [Cancel]           │
└────────────────────────────────────┘
```

**Add these 9 variables:**

#### 1️⃣ BACKEND_URL
```
Name:  BACKEND_URL
Value: https://gate-epass-w82j.onrender.com
Click [Save Variable]
```

#### 2️⃣ FRONTEND_URL
```
Name:  FRONTEND_URL
Value: https://gatepass-rho.vercel.app
Click [Save Variable]
```

#### 3️⃣ FRONTEND_URL_ALT
```
Name:  FRONTEND_URL_ALT
Value: http://127.0.0.1:3000
Click [Save Variable]
```

#### 4️⃣ SECRET_KEY
```
Name:  SECRET_KEY
Value: arunaw
Click [Save Variable]
```

#### 5️⃣ MAIL_USERNAME
```
Name:  MAIL_USERNAME
Value: infotechcheb@gmail.com
Click [Save Variable]
```

#### 6️⃣ MAIL_PASSWORD
```
Name:  MAIL_PASSWORD
Value: wzxk axwa iifa iplk
Click [Save Variable]
```

#### 7️⃣ DATABASE_URL
```
Name:  DATABASE_URL
Value: sqlite:///mysql.db
Click [Save Variable]
```

#### 8️⃣ FLASK_ENV
```
Name:  FLASK_ENV
Value: production
Click [Save Variable]
```

#### 9️⃣ DEBUG
```
Name:  DEBUG
Value: False
Click [Save Variable]
```

---

### 🔄 Step 5: Redeploy Backend

After all variables are added, you should see a notification:
```
┌──────────────────────────────────────────┐
│ Changes detected. Redeploy your service? │
│ [Redeploy] [Cancel]                      │
└──────────────────────────────────────────┘
```

Click **[Redeploy]** button

---

### ⏳ Step 6: Wait for Deployment

Go to **Deployments** tab and wait for status to show:
```
✓ LIVE (Green checkmark)
```

The backend is now deployed with all environment variables! ✅

---

---

## VERCEL FRONTEND - Step by Step with Screenshots

### 🔗 Step 1: Open Vercel Dashboard
**URL**: https://vercel.com

```
1. Click "Projects" (top navigation)
2. Find and select "gatepass" project
```

---

### ⚙️ Step 2: Go to Settings
```
At the top of your project page, you should see tabs:
[Overview] [Deployments] [Settings]

Click: Settings
```

---

### 📋 Step 3: Find Environment Variables
```
In the left sidebar under Settings, click:
"Environment Variables"

You should see a section like:
┌─────────────────────────────────────┐
│ Environment Variables               │
│                                      │
│ [+ Add Environment Variable] button   │
└─────────────────────────────────────┘
```

---

### ✏️ Step 4: Add Variables

**Add these 2 variables:**

#### 1️⃣ REACT_APP_API_URL

```
Form:
┌────────────────────────────────────┐
│ Name: REACT_APP_API_URL           │
│ Value: https://gate-epass-w82j.on │
│        render.com                  │
│                                    │
│ Environments:                      │
│ ☑ Production                       │
│ ☑ Preview                          │
│ ☑ Development                      │
│                                    │
│ [Add] [Cancel]                     │
└────────────────────────────────────┘
```

**IMPORTANT**: Check all three environments (Production, Preview, Development)

#### 2️⃣ REACT_APP_BACKEND_URL

```
Form:
┌────────────────────────────────────┐
│ Name: REACT_APP_BACKEND_URL        │
│ Value: https://gate-epass-w82j.on │
│        render.com                  │
│                                    │
│ Environments:                      │
│ ☑ Production                       │
│ ☑ Preview                          │
│ ☑ Development                      │
│                                    │
│ [Add] [Cancel]                     │
└────────────────────────────────────┘
```

---

### 🔄 Step 5: Redeploy Frontend

After variables are added:
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **three dots (...) menu**
4. Select **Redeploy**
5. Confirm: Click **Redeploy** again

```
┌──────────────────────────────────┐
│ Redeploying...                   │
│ This may take a few minutes.     │
└──────────────────────────────────┘
```

---

### ⏳ Step 6: Wait for Deployment

Check status in Deployments tab:
```
✓ PRODUCTION (Green checkmark) - Ready
```

The frontend is now deployed with all environment variables! ✅

---

---

## 🎯 After Deployment - What Should Work

### ✅ Backend (Render)
1. API requests from `https://gatepass-rho.vercel.app` are allowed
2. Images load from `https://gate-epass-w82j.onrender.com/uploads/`
3. Login/JWT tokens work
4. Email notifications send
5. No debug mode errors

### ✅ Frontend (Vercel)
1. Page loads at `https://gatepass-rho.vercel.app`
2. API calls go to `https://gate-epass-w82j.onrender.com`
3. Data loads without CORS errors
4. Login works
5. Images display correctly

---

## 🔍 Testing After Deployment

### Test 1: API Connectivity
```
1. Visit https://gatepass-rho.vercel.app
2. Open DevTools (F12)
3. Go to Network tab
4. Try to login
5. Check if request goes to: https://gate-epass-w82j.onrender.com
6. Should see 200 or 201 response (success)
```

### Test 2: Images Loading
```
1. Login as a user
2. Go to a page that shows images (guest photos)
3. Right-click image → Open in new tab
4. URL should be: https://gate-epass-w82j.onrender.com/uploads/...
5. Image should load without errors
```

### Test 3: CORS Check
```
1. Open DevTools Console
2. Should NOT see any CORS errors
3. If you see CORS error, backend FRONTEND_URL is incorrect
```

### Test 4: Environment Variables
```
1. Open DevTools Console
2. Type: console.log(process.env.REACT_APP_API_URL)
3. Should show: https://gate-epass-w82j.onrender.com
```

---

## ⚠️ Common Issues & Fixes

### Issue 1: "CORS error" in console
```
Error: Access to XMLHttpRequest blocked by CORS policy

Fix:
1. Go to Render Dashboard
2. Settings → Environment Variables
3. Check FRONTEND_URL = https://gatepass-rho.vercel.app
4. Click Redeploy
5. Wait 2-3 minutes and refresh browser
```

### Issue 2: "Cannot GET /..." (404 error)
```
Error: 404 Not Found

Fix:
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Check REACT_APP_API_URL = https://gate-epass-w82j.onrender.com
4. Click Redeploy
5. Wait 2-3 minutes and refresh browser
```

### Issue 3: Images showing as broken (red X)
```
Error: Image failed to load

Fix:
1. Go to Render Dashboard
2. Settings → Environment Variables
3. Check BACKEND_URL = https://gate-epass-w82j.onrender.com
4. Click Redeploy
5. Images should load after 2-3 minutes
```

### Issue 4: Backend service keeps crashing
```
Error: Service temporarily unavailable

Fix:
1. Check all 9 environment variables are set
2. Check FLASK_ENV = production
3. Check DEBUG = False
4. Go to Deployments tab and check logs for errors
```

---

## 📊 Final Verification Matrix

| Check | Status | Fix |
|-------|--------|-----|
| Render has 9 variables set | ✅ | Set all variables |
| FLASK_ENV = production | ✅ | Change from development |
| DEBUG = False | ✅ | Change from True |
| Vercel has 2 variables set | ✅ | Set both variables |
| REACT_APP_* start correctly | ✅ | Variable names must be exact |
| Both are redeployed | ✅ | Click Redeploy button |
| Frontend loads at HTTPS | ✅ | Check Vercel dashboard |
| Backend responding at HTTPS | ✅ | Check Render dashboard |
| No CORS errors | ✅ | Check browser console |
| API calls working | ✅ | Check Network tab in DevTools |
| Images loading | ✅ | Check image URLs |

---

## 🎉 Success!

Once all steps are complete, your application is:
- ✅ Deployed to production
- ✅ Using environment variables (no hardcoded URLs)
- ✅ Frontend connected to backend
- ✅ Images loading correctly
- ✅ CORS working properly
- ✅ Ready for users!

**Total time to complete**: ~15 minutes
**Difficulty level**: Easy (just copy-paste values)
