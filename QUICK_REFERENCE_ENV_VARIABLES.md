# ⚡ QUICK REFERENCE: What to Add Where

## Copy-Paste Ready! 📋

### RENDER Backend Dashboard
**URL**: https://dashboard.render.com → Services → gate-epass-w82j → Settings → Environment

**Copy and paste these 9 variables:**

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

✅ After adding all 9: Click **Redeploy**

---

### VERCEL Frontend Dashboard
**URL**: https://vercel.com → Projects → gatepass → Settings → Environment Variables

**Copy and paste these 2 variables:**

```
REACT_APP_API_URL = https://gate-epass-w82j.onrender.com
REACT_APP_BACKEND_URL = https://gate-epass-w82j.onrender.com
```

✅ After adding both: Go to **Deployments** → Find latest → **Redeploy** it

---

## 🎯 Why Each Variable?

| Variable | Used For | Where |
|----------|----------|-------|
| `BACKEND_URL` | Image URLs in API responses | Backend |
| `FRONTEND_URL` | CORS allow list | Backend |
| `FRONTEND_URL_ALT` | Local dev CORS allow | Backend |
| `SECRET_KEY` | JWT tokens (login) | Backend |
| `MAIL_USERNAME` | Send emails from this | Backend |
| `MAIL_PASSWORD` | Gmail app password | Backend |
| `DATABASE_URL` | SQLite database path | Backend |
| `FLASK_ENV` | Production mode | Backend |
| `DEBUG` | No debug errors in production | Backend |
| `REACT_APP_API_URL` | Where frontend sends API requests | Frontend |
| `REACT_APP_BACKEND_URL` | Same as above (alternative name) | Frontend |

---

## ⏱️ Expected Timeline

```
1. Add 9 variables to Render: ~3 minutes
2. Render redeploys: ~2-3 minutes
3. Add 2 variables to Vercel: ~2 minutes
4. Vercel redeploys: ~2-3 minutes
────────────────────────────────
Total: ~10-15 minutes
```

---

## ✅ After Deployment

### Test in this order:
1. Visit `https://gatepass-rho.vercel.app`
2. Open DevTools (F12) → Console tab
3. Try to login
4. Check Network tab for API requests
5. Should see calls to `https://gate-epass-w82j.onrender.com`
6. No red X on images
7. No CORS errors in console

---

## 🚨 If Something Goes Wrong

### "Cannot connect to API"
→ Check Vercel: `REACT_APP_API_URL` is correct

### "CORS error"
→ Check Render: `FRONTEND_URL` is correct

### "Images not loading"
→ Check Render: `BACKEND_URL` is correct

### "Still not working after 5 minutes?"
→ Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

---

## 📞 Need Help?

**Backend not responding?**
- Go to Render → Deployments → Check for red X
- Click deployment to see error logs

**Frontend not connecting?**
- Go to Vercel → Deployments → Check status
- Open DevTools → Console → Look for error messages

**Images still broken?**
- Hard refresh browser
- Check if backend URL matches exactly

---

## 🎉 Done!

Once you see:
- ✅ No errors in browser console
- ✅ API calls going to backend
- ✅ Images loading
- ✅ Login working

**Your production deployment is complete!** 🚀
