# 👥 Employee Setup Guide - Lead Generation Engine

## ✅ **System is Ready for Employee Use**

This guide explains how to set up and use the Lead Generation Engine for testing and generating leads.

---

## 🔐 **Authentication Options**

### **Option 1: Web UI Login** (Recommended for Testing)
1. Open the web interface: `http://localhost:8000`
2. Login with:
   - **Email:** Any email address
   - **Password:** Any password (minimum 4 characters)
   - **Admin:** Use credentials from `.env` file

### **Option 2: API Key** (For Programmatic Access)
Set API keys in `.env` file:
```env
EMPLOYEE_API_KEYS=employee_key_1,employee_key_2
```

Then use in API requests:
```bash
curl -H "X-API-Key: employee_key_1" http://localhost:8000/runs
```

### **Option 3: Supabase Integration** (Future)
When integrated with main app, Supabase tokens will work automatically.

---

## 📊 **Usage Limits**

The system has built-in limits to prevent abuse:

- **Max Runs Per Day:** 50 runs (configurable via `MAX_RUNS_PER_DAY`)
- **Max Leads Per Run:** 5,000 leads (configurable via `MAX_LEADS_PER_RUN`)
- **Max API Calls Per Day:** 10,000 calls (configurable via `MAX_API_CALLS_PER_DAY`)

**Note:** You'll see warnings when approaching limits.

---

## 🚀 **How to Generate Leads**

### **Step 1: Configure Search**
1. **Keywords:** Enter search terms (e.g., "roofing contractors", "software companies")
2. **Location:** Enter geographic area (e.g., "New York, USA", "California")
3. **Category:** Select industry category from dropdown
4. **Limit:** Set number of leads to generate (1-5000)

### **Step 2: Choose Data Sources**
- ✅ **Overpass API:** Free business discovery (recommended)
- ✅ **Yelp:** Business listings
- ⚠️ **Yellow Pages:** Optional
- ⚠️ **Clearbit:** Requires API key (enrichment)
- ⚠️ **LinkedIn:** Requires API key (enrichment)

### **Step 3: Advanced Options**
- **Enable Embedding Scoring:** Prioritize leads matching your keywords (recommended)
- **Enable Embedding Dedupe:** Better duplicate detection (recommended)
- **Free Mode:** ⚠️ **WARNING** - Uses mock/test data (not real leads)

### **Step 4: Start Run**
Click "Start Lead Generation" and wait for completion.

---

## ⚠️ **Important Warnings**

### **Free Mode = Mock Data**
When `free_mode=true`:
- ❌ Data may be fake/test data
- ❌ Email validation is basic (not accurate)
- ❌ Business information may be incomplete
- ✅ Use only for testing, not real outreach

**Always check the summary for warnings about mock data usage.**

### **Data Quality Indicators**
After a run completes, check the summary:
- **Green:** Real data from APIs
- **Yellow Warning:** Mock data was used
- **Validation Strategy:** Shows how emails were validated

---

## 📈 **Monitoring Your Usage**

### **View Usage Stats**
The UI shows:
- Runs started today
- API calls made
- Remaining limits

### **Check Run Status**
- **Running:** Currently processing
- **Completed:** Successfully finished
- **Failed:** Error occurred (check message)

### **View Results**
1. Click "View" on completed run
2. See summary with:
   - Companies found
   - Emails discovered
   - Validation results
   - Data quality warnings

---

## 🔧 **Troubleshooting**

### **"Too many requests" Error**
- You've hit daily limit
- Wait until tomorrow or contact admin

### **"Run failed" Error**
- Check error message in run details
- Common causes:
  - Invalid search parameters
  - API rate limits
  - Network issues

### **No Leads Found**
- Try different keywords
- Expand geographic area
- Check if free_mode is enabled (may return mock data)

### **Poor Data Quality**
- Disable `free_mode` if enabled
- Add API keys for better data sources
- Enable embedding scoring for better relevance

---

## 📝 **Best Practices**

### **For Testing:**
1. Start with small limits (10-50 leads)
2. Use free_mode to test workflow
3. Verify data quality before scaling

### **For Production:**
1. **Disable free_mode** - Use real API keys
2. Use specific keywords - Better results
3. Enable embedding scoring - Better relevance
4. Enable embedding dedupe - Avoid duplicates
5. Check summaries - Verify data quality

### **Keyword Tips:**
- ✅ **Good:** "roofing contractors", "software development companies"
- ❌ **Bad:** "business", "company", "services" (too generic)

### **Location Tips:**
- ✅ **Good:** "New York, USA", "Los Angeles, California"
- ❌ **Bad:** "USA" (too broad)

---

## 🎯 **What Gets Tracked**

The system tracks:
- All runs started
- API calls made
- Data sources used
- Errors encountered
- Data quality metrics

**This helps:**
- Monitor usage
- Identify issues
- Improve data quality

---

## 📞 **Support**

If you encounter issues:
1. Check error messages in run details
2. Review usage limits
3. Check data quality warnings
4. Contact admin if problems persist

---

## 🔄 **Integration with Main App**

When integrated with your main Supabase app:
- Authentication will use Supabase tokens
- User management will be centralized
- Usage tracking will sync with main system

**Current system works standalone for testing.**

---

**Last Updated:** 2025-12-11
**Version:** 1.0



