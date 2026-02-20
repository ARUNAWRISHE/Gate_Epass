# 📝 IMPORTANT: URL Port Changes After Revert

## What Happened

Commit a1a9901 changed URLs from port 5000 to 5001 like this:
```
http://localhost:5000    →    http://localhost:5001
http://127.0.0.1:5000    →    http://127.0.0.1:5001
```

By reverting that commit, the files now **have port 5000** again.

---

## Current Situation

**Your Backend is running on**: `http://127.0.0.1:5001` ✅

**But the frontend now has**: `http://localhost:5000` and `http://127.0.0.1:5000` ❌

---

## Options

### Option A: Update URLs Back to 5001 (RECOMMENDED)
Since your backend is on port 5001, the frontend needs port 5001.

**Files that need updating:**
1. `frontend/src/components/AddHodAndShowHodsPage.js` - 4 URLs
2. `frontend/src/components/Adminhome.js` - 1 URL
3. `frontend/src/components/Adminlog.js` - 3 URLs
4. `frontend/src/components/AllRequests.js` - 6 URLs
5. `frontend/src/components/PrincipalRequests.js` - 5 URLs
6. `frontend/src/components/Security.js` - 4 URLs
7. `frontend/src/components/ShowRequestsPage.js` - 1 URL

**Total**: ~24 hardcoded URLs to change from 5000 → 5001

### Option B: Change Backend to Port 5000
Run Flask on port 5000 instead of 5001.

### Option C: Use Environment Variables (BEST)
Instead of hardcoding URLs, use the `.env` file approach that's already set up.

The `api.js` already has: `process.env.REACT_APP_API_URL`

---

## What Do You Want to Do?

1. **Update all 24 URLs to port 5001** → I can do this automatically
2. **Change backend to port 5000** → Simple Flask config change
3. **Use environment variables instead** → Already configured, just need to use `api.js`
4. **Keep the revert but ignore the port issue** → For now, manually use port 5000 or 5001

---

## Status

✅ Commit a1a9901 has been successfully reverted
⚠️ Frontend now has port 5000, backend is on port 5001
🚀 Need to align ports or use env variables

**Let me know your preference!**
