# 🎯 Quick Reference - Deployed Links & Configuration

## Live URLs

```
Frontend:  https://gatepass-rho.vercel.app/
Backend:   https://gate-epass-w82j.onrender.com/
```

## Critical Configuration Files

### Frontend (Vercel)
- ✅ `.env.production` → `REACT_APP_API_URL=https://gate-epass-w82j.onrender.com/`
- ✅ `vercel.json` → Build & deployment settings
- ✅ `src/api.js` → Uses environment variable for API URL

### Backend (Render)
- ✅ `runtime.txt` → Python 3.11.7
- ✅ `requirements.txt` → Updated dependencies
- ✅ `app.py` → CORS configured for Vercel domain

## Testing API Connectivity

```bash
# Test from Vercel frontend can reach Render backend
curl -H "Origin: https://gatepass-rho.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     https://gate-epass-w82j.onrender.com/
```

Expected: `200 OK` with CORS headers

## Local Development

```bash
# Frontend (uses .env.local)
cd frontend && npm run client

# Backend (Python 3.10+)
cd backend && python app.py

# Both use localhost:3000 & localhost:5001
```

## If Deployment Fails

1. **Vercel frontend build error**:
   - Check `CI=false` in Vercel environment variables
   - Verify `.env.production` exists

2. **Render backend error**:
   - Check `runtime.txt` for Python version
   - Verify `requirements.txt` has compatible versions
   - Check Render logs for specific errors

3. **API not communicating**:
   - Verify CORS origins in `app.py`
   - Check frontend API URL in DevTools → Network
   - Ensure backend is running (`gate-epass-w82j.onrender.com` should respond)

## Useful Commands

```bash
# Check what API URL frontend is using
grep -r "REACT_APP_API_URL" frontend/

# Check CORS configuration
grep -A 15 "CORS(app" backend/app.py

# Test backend is alive
curl https://gate-epass-w82j.onrender.com/

# View Vercel logs
# https://vercel.com/dashboard

# View Render logs
# https://dashboard.render.com/
```

---

**Both services deployed and configured ✅**
