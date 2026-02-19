# 🚀 QUICK START: Using Environment Variables

## Current Status ✅
- ✅ Backend `.env` file is configured
- ✅ Frontend `.env.local` (local development) is configured
- ✅ Frontend `.env.production` (production build) is configured
- ✅ Backend `app.py` CORS is reading from environment variables
- ✅ Backend image URLs are using environment variables

---

## 📋 Quick Commands

### Local Development
```bash
# Terminal 1: Backend
cd backend
python app.py
# This will use backend/.env with local/production URLs

# Terminal 2: Frontend
cd frontend
npm start
# This will use frontend/.env.local with local URLs (http://127.0.0.1:5001)
```

### Production Build
```bash
cd frontend
npm run build
# This will use frontend/.env.production with production URLs (https://gate-epass-w82j.onrender.com)
```

---

## 🔄 How to Switch Between Environments

### For Local Development
The system automatically uses:
- **Backend**: `backend/.env` (currently set to production URLs)
- **Frontend**: `frontend/.env.local` (currently set to local URLs)

### For Production Deployment
The system automatically uses:
- **Backend**: Environment variables set in Render dashboard
- **Frontend**: `frontend/.env.production` (currently set to production URLs)

---

## 📝 Current Configuration

### Backend `.env` (backend/.env)
```properties
# These are used by the backend application
BACKEND_URL=https://gate-epass-w82j.onrender.com/
FRONTEND_URL=https://gatepass-rho.vercel.app/
FRONTEND_URL_ALT=http://127.0.0.1:3000
```

**⚠️ Note**: If you want to work on **local development**, change these to:
```properties
BACKEND_URL=http://127.0.0.1:5001
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_ALT=http://127.0.0.1:3000
```

### Frontend `.env.local` (frontend/.env.local)
```bash
# This is used ONLY when running 'npm start' (local development)
REACT_APP_API_URL=http://127.0.0.1:5001
REACT_APP_BACKEND_URL=http://127.0.0.1:5001
```

### Frontend `.env.production` (frontend/.env.production)
```bash
# This is used when running 'npm run build' (production)
REACT_APP_API_URL=https://gate-epass-w82j.onrender.com
REACT_APP_BACKEND_URL=https://gate-epass-w82j.onrender.com
```

---

## 🎯 To Change Backend URL Globally

### Option 1: Update local .env files
Simply modify the values in:
- `backend/.env` - Change `BACKEND_URL` and `FRONTEND_URL`
- `frontend/.env.local` - Change `REACT_APP_API_URL`
- `frontend/.env.production` - Change `REACT_APP_API_URL` (for production build)

Then restart your application and all URLs will automatically use the new values.

### Option 2: Environment variables in deployment
For Render (backend):
1. Go to https://dashboard.render.com
2. Select your service "gate-epass-w82j"
3. Click "Settings"
4. Scroll to "Environment"
5. Update `BACKEND_URL` and `FRONTEND_URL` values
6. Click "Save changes" and service will redeploy

For Vercel (frontend):
1. Go to https://vercel.com
2. Select your project "gatepass"
3. Go to "Settings" → "Environment Variables"
4. Update `REACT_APP_API_URL` and `REACT_APP_BACKEND_URL` values
5. Redeploy by going to "Deployments" and clicking "Redeploy"

---

## ✅ Verification

### Verify Backend Is Using Env Variables
```bash
cd backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Backend URL:', os.getenv('BACKEND_URL')); print('Frontend URL:', os.getenv('FRONTEND_URL'))"
```

Expected output:
```
Backend URL: https://gate-epass-w82j.onrender.com/
Frontend URL: https://gatepass-rho.vercel.app/
```

### Verify Frontend Is Using Env Variables (Local)
1. Start the frontend: `cd frontend && npm start`
2. Open browser console (F12)
3. Type: `console.log(process.env.REACT_APP_API_URL)`
4. Should show: `http://127.0.0.1:5001`

---

## 📊 Environment Variables Used

| Variable | File | Usage | Current Value |
|----------|------|-------|---------------|
| `BACKEND_URL` | `backend/.env` | Backend image URLs | `https://gate-epass-w82j.onrender.com/` |
| `FRONTEND_URL` | `backend/.env` | CORS origins | `https://gatepass-rho.vercel.app/` |
| `FRONTEND_URL_ALT` | `backend/.env` | CORS alt origins | `http://127.0.0.1:3000` |
| `REACT_APP_API_URL` | `frontend/.env.local` | Frontend API calls (local) | `http://127.0.0.1:5001` |
| `REACT_APP_API_URL` | `frontend/.env.production` | Frontend API calls (prod) | `https://gate-epass-w82j.onrender.com` |

---

## 🔍 Where Are These Variables Used?

### Backend (`app.py`)
- **Line 28-34**: CORS configuration reads `FRONTEND_URL` and `FRONTEND_URL_ALT`
- **Line ~907**: Image URLs read `BACKEND_URL` when generating guest image URLs
- **Line ~50+**: Email configuration reads `MAIL_USERNAME` and `MAIL_PASSWORD`

### Frontend (`api.js`)
- **Already implemented**: Reads `REACT_APP_API_URL` to set the base URL for all API calls
- All components using `api.js` automatically get the correct URL

---

## ⚠️ Important Notes

1. **Local Development**: Make sure `backend/.env` has local URLs if you're testing locally
2. **Production**: The deployed backend/frontend automatically read from their respective deployment dashboards
3. **npm start vs npm run build**: Different .env files are used
   - `npm start` uses `frontend/.env.local`
   - `npm run build` uses `frontend/.env.production`

---

## 🐛 Troubleshooting

### "API requests failing" or "CORS error"
1. Check `backend/.env` - Verify `FRONTEND_URL` matches your frontend's actual URL
2. Check `frontend/.env.local` or `frontend/.env.production` - Verify `REACT_APP_API_URL` matches backend URL
3. Restart your application after changing .env files

### "Environment variables not updating"
- Node/Python caches environment variables at startup
- Solution: Completely stop and restart your server
- `Ctrl+C` to stop, then run again

### "Different behavior locally vs production"
- Local uses `frontend/.env.local` and `backend/.env`
- Production uses `frontend/.env.production` and environment variables from dashboards
- Make sure both have the correct URLs

---

## 🎉 Summary

Your application is now **100% configurable** via environment variables:
- Change `backend/.env` → All backend CORS and image URLs update
- Change `frontend/.env.local` → All frontend local dev API calls update
- Change `frontend/.env.production` → All frontend production API calls update

**No code changes needed!** Just update the `.env` files and restart.
