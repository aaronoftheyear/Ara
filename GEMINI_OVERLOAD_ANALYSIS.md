# 🔍 Gemini API Overload Analysis

**Date:** 2025-11-13  
**Issue:** Frequent 503 (Service Unavailable) errors from Gemini API

---

## ⚠️ **IMPORTANT: API Key Quota Sharing**

**Discovery:** Both API keys (`VITE_GEMINI_REC_API_KEY` and `VITE_GEMINI_CHAT_API_KEY`) are from the same Google Cloud project.

**Impact:** 
- **They share the same quota/rate limits** - not double the space!
- 15 requests/minute limit applies to BOTH keys combined
- Using two keys doesn't give you 30 requests/minute, still only 15

**Solution:**
- Create API keys from **different Google Cloud projects** to get separate quotas
- OR: Use only one API key for both recommendation and chat
- OR: Upgrade to paid tier for higher limits (150 req/min per project)

---

## 📊 Root Causes

### 1. **Large System Instruction Size** ⚠️ PRIMARY ISSUE
- **Current Size:** ~40,000 characters per request
- **Components:**
  - Character personality & preferences (~2,000 chars)
  - Expertise mapping & buddy system (~5,000 chars)
  - Complete exclusion list (~10,000+ chars for large lists)
  - Plan-to-watch list (~2,000 chars)
  - User preference data (~5,000 chars)
  - Seasonal anime lists (~3,000 chars)
  - Streaming platform examples (~2,000 chars)
  - Detailed instructions & rules (~11,000 chars)

**Impact:** Large payloads take longer to process, increasing server load and timeout risk.

### 2. **Free Tier Rate Limits**
- **Limit:** 15 requests per minute
- **Problem:** Retries count toward this limit
  - 1 user request → 3 retry attempts = 4 API calls
  - 4 requests × 3 users = 12 requests (80% of limit)
  - Any additional requests = rate limit hit

### 3. **Google's Server Capacity**
- **External Factor:** High global demand on Gemini API
- **Peak Times:** Evenings, weekends, popular regions
- **Temporary:** Google's infrastructure may be overloaded

### 4. **Retry Strategy**
- **Current:** 3 retries with exponential backoff (2s, 4s, 8s)
- **Issue:** If server is truly overloaded, retries just add more load
- **Better:** Longer initial wait, fewer retries

---

## ✅ Solutions (Ranked by Impact)

### **Solution 1: Reduce System Instruction Size** 🎯 HIGHEST PRIORITY

**Current Issues:**
- Sending complete exclusion lists (could be 400+ titles)
- Redundant instructions repeated in every request
- Large character personality descriptions

**Optimizations:**

1. **Truncate Exclusion List:**
   ```typescript
   // Instead of all titles, send top 100 most relevant
   const exclusionList = excludedTitles.slice(0, 100).join(', ');
   // Add note: "And 300+ more titles (check full list before recommending)"
   ```

2. **Cache Static Instructions:**
   - Character personality, expertise mapping, rules don't change
   - Only send dynamic data (exclusion list, user preferences)

3. **Compress Format:**
   - Use shorter codes (already doing this for status)
   - Remove redundant examples
   - Shorten instruction text

**Expected Reduction:** 40K → ~25K characters (37% smaller)

---

### **Solution 2: Improve Retry Strategy** 🔄 MEDIUM PRIORITY

**Current:**
- 3 retries with 2s, 4s, 8s delays
- Retries immediately on 503

**Better:**
- 2 retries with longer delays (5s, 15s)
- Check if error is truly recoverable before retrying
- Add jitter to avoid thundering herd

**Code Change:**
```typescript
const maxRetries = 2; // Reduce from 3
const waitTime = Math.pow(3, attempt) * 1000; // 3s, 9s instead of 2s, 4s, 8s
```

---

### **Solution 3: Request Throttling** ⏱️ MEDIUM PRIORITY

**Add client-side rate limiting:**
- Track requests per minute
- Queue requests if approaching limit
- Show user-friendly "please wait" message

**Implementation:**
```typescript
let requestCount = 0;
let requestWindow = Date.now();

if (requestCount >= 12) { // Leave buffer below 15/min
  const waitTime = 60000 - (Date.now() - requestWindow);
  await delay(waitTime);
  requestCount = 0;
  requestWindow = Date.now();
}
```

---

### **Solution 4: Optimize When to Retry** 🎯 LOW PRIORITY

**Current:** Retries on any 503 error

**Better:** 
- Distinguish between temporary overload vs. persistent issues
- Don't retry if multiple consecutive failures
- Show user message earlier instead of retrying

---

## 📈 Expected Improvements

| Solution | Impact | Effort | Priority |
|----------|--------|--------|----------|
| Reduce System Instruction | High | Medium | ⭐⭐⭐ |
| Improve Retry Strategy | Medium | Low | ⭐⭐ |
| Request Throttling | Medium | Medium | ⭐⭐ |
| Optimize Retries | Low | Low | ⭐ |

---

## 🚀 Quick Wins (Do First)

1. **Truncate exclusion list to top 100 titles** (5 min)
2. **Reduce retries from 3 to 2** (2 min)
3. **Increase initial retry delay to 5 seconds** (2 min)

**Total Time:** ~10 minutes  
**Expected Reduction:** 30-40% fewer overload errors

---

## 📝 Long-term Solutions

1. **Implement request queuing** - Better UX, prevents rate limit hits
2. **Cache static instructions** - Reduce payload size significantly
3. **Progressive loading** - Send minimal data first, expand if needed
4. **Consider paid tier** - Higher rate limits (150 req/min vs 15)

---

## 🔍 Monitoring

**Track these metrics:**
- System instruction size per request
- 503 error rate
- Average retry count
- Request frequency

**Add logging:**
```typescript
console.log(`📊 Request Stats:`, {
  instructionSize: systemInstruction.length,
  exclusionCount: excludedTitles.length,
  timestamp: new Date().toISOString()
});
```

---

## 💡 Why This Happens

**The Perfect Storm:**
1. Large payloads (40K chars) → Slow processing
2. Free tier limits (15/min) → Easy to hit
3. High demand (popular API) → Server overload
4. Aggressive retries → More load on already overloaded servers

**Result:** 503 errors become self-perpetuating - more retries = more load = more 503s

---

## ✅ Immediate Action Plan

1. ✅ **DONE:** Removed non-existent fallback models (prevents 404s)
2. 🔄 **TODO:** Reduce system instruction size
3. 🔄 **TODO:** Improve retry strategy
4. 🔄 **TODO:** Add request throttling

---

**Next Steps:** Implement Solution 1 (reduce instruction size) for biggest impact.

