# 🚀 Gate_Epass Deployment Configuration

## Deployed Links

### Frontend (Vercel)
- **URL**: https://gatepass-rho.vercel.app/
- **Platform**: Vercel
- **Status**: ✅ Live

### Backend (Render)
- **URL**: https://gate-epass-w82j.onrender.com/
- **Platform**: Render
- **Status**: ✅ Live

---

## Configuration Files Updated

### 1. Frontend Configuration (Vercel)

#### `.env.production`
```bash
REACT_APP_API_URL=https://gate-epass-w82j.onrender.com/
```
- ✅ Points to production backend on Render
- Used for production builds deployed to Vercel

#### `.env.local`
```bash
REACT_APP_API_URL=http://127.0.0.1:5001
```
- For local development with local backend

#### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "env": {
    "CI": "false"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
- Configures build settings for Vercel
- Enables SPA routing with rewrites
- Sets `CI=false` to prevent build failures from ESLint warnings

#### `src/api.js`
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001";
const API = axios.create({ baseURL: API_BASE_URL });
```
- ✅ Dynamically loads API URL from environment
- Fallback to localhost for development

---

### 2. Backend Configuration (Render)

#### `runtime.txt`
```
python-3.11.7
```
- Specifies Python version for Render

#### `requirements.txt` (Updated)
- ✅ All dependencies updated to latest stable versions
- pandas 1.5.3 → 2.1.0 (fixed `__version__` KeyError)
- Flask 2.2.5 → 2.3.3
- All other packages updated for compatibility

#### `app.py` (CORS Configuration)
```python
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://gatepass-rho.vercel.app",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
```
- ✅ Allows CORS requests from Vercel frontend
- Maintains localhost for development

---

## How It Works

### Frontend to Backend Flow

1. **User accesses** https://gatepass-rho.vercel.app/ in browser
2. **Frontend loads** with `REACT_APP_API_URL=https://gate-epass-w82j.onrender.com/`
3. **API calls** are made to Render backend automatically via `api.js`
4. **Backend responds** with CORS headers allowing Vercel domain
5. **Data displays** in frontend

### Local Development Flow

1. **Run frontend**: `npm run client` (port 3000)
2. **Run backend**: `python app.py` (port 5001)
3. **Frontend uses** `.env.local` with `http://127.0.0.1:5001`
4. **All requests** stay on localhost

---

## Environment Variables Summary

### Vercel Dashboard (Frontend)
| Variable | Value |
|----------|-------|
| `CI` | `false` |
| `REACT_APP_API_URL` | `https://gate-epass-w82j.onrender.com/` |

### Render Dashboard (Backend)
| Variable | Value |
|----------|-------|
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Root Directory | `backend` |
| Python Version | 3.11 |

---

## Testing Deployment

### Test Frontend
1. Visit https://gatepass-rho.vercel.app/
2. Login with credentials
3. Check if API calls succeed (open DevTools → Network tab)

### Test Backend
1. Visit https://gate-epass-w82j.onrender.com/
2. Should see Flask response
3. Check CORS is working: `curl -H "Origin: https://gatepass-rho.vercel.app" https://gate-epass-w82j.onrender.com/`

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **CORS Error in frontend** | Verify `CORS` configuration in `app.py` includes Vercel URL |
| **API returns 404** | Ensure backend `/uploads` directory exists on Render |
| **Build fails on Vercel** | Check `.env.production` and `CI=false` in Vercel dashboard |
| **Backend returns 500** | Check Render logs for specific error messages |

---

## Redeployment Instructions

### If you update backend code:
1. Push to GitHub: `git push`
2. Render auto-deploys (or manually trigger)
3. Wait for deployment to complete

### If you update frontend code:
1. Push to GitHub: `git push`
2. Vercel auto-deploys (or manually trigger)
3. Wait for build and deployment

---

## Security Notes

✅ CORS properly configured  
✅ API uses JWT tokens (24-hour expiry)  
✅ Environment variables not exposed in client code  
✅ Production database on Render backend  

---

**Last Updated**: February 19, 2026  
**Deployment Status**: ✅ Both Frontend and Backend Live
