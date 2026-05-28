# Marketing Funnel & Conversion Performance Analysis
**Project ID:** FUTURE_DS_03  
**Domain:** Marketing Analytics / Growth Data Science  

Welcome to the **Marketing Funnel & Conversion Performance Analysis** system. This repository covers the complete analytical lifecycle of an enterprise multi-channel promotion setup, focusing on conversion drop-offs, budget efficiency, A/B Testing, and region/device attribution.

---

## 📂 Project Structure

```text
FUTURE_DS_03/
├── README.md               <-- Full project documentation and setup
├── requirements.txt         <-- Python environment dependencies
├── analytics.py             <-- Core ETL, Data Cleaning & Analytics Engine
├── dashboard.py             <-- Streamlit interactive dashboard logic
├── funnel_analysis.ipynb    <-- Jupyter Notebook exploratory study
└── reports/
    └── figures/             <-- Generated analytical visualizations
```

---

## 📊 Dataset Schema

The system supports standard raw logs generated dynamically by ad platform integrations (Google Ads, Facebook Business, HubSpot).
- **Lead ID:** Unique trace identifier for the transaction track.
- **Marketing Channel:** `Google Search`, `Facebook Ads`, `LinkedIn CRM`, `YouTube Video`, `Email Newsletter`, `Organic Search`.
- **Campaign Name:** Dedicated specific promo identifiers (e.g., `Brand Paid search`, `Spring Promo 2026`).
- **Impressions / Clicks / Website Visits / Signups / Purchases:** Conversions across successive nested funnel stages.
- **Campaign Cost ($):** Absolute financial spend on the campaign.
- **Revenue Generated ($):** Financial income from user conversions.
- **Device Type / Region / Date:** Dimensional parameters.

---

## ⚙️ Direct Setup & Running Code

### 1. Installation
Clone the workspace repository and install dependencies:
```bash
pip install -r requirements.txt
```

### 2. Run Processing Pipeline
Performs deduplication, imputes missing values, caps outliers, calculates metrics, and exports cleaned CSV datasets & visualization figures:
```bash
python analytics.py
```

### 3. Launch the Interactive Dashboard
Boot up the Streamlit-based web report dashboard locally:
```bash
streamlit run dashboard.py
```

---

## 📈 Key Insights & Recommendations Summary

### Operational Drop-offs Analysis
- **The Click-to-Visit Bottleneck:** A high drop-off rate (~15%) exists between Clicks and Website Visits (often caused by page load timeouts or invalid navigation links).
- **Region Dynamics:** **North America** remains the primary revenue driver, but **Asia-Pacific** represents the highest incremental conversion speed based on click-through performance active in Desktop spaces.
- **LinkedIn CRM Pricing Model:** Highly localized, low-density but very high average customer purchase value. It provides the strongest individual conversion rates (20%), justifying its premium CPA ($).

### Strategy Optimizations
1. **Reduce Landing Page Latency:** Optimize CDN caches and bundle payloads to reduce the click-to-visit bounce.
2. **Channel Budget Reallocation:** Reallocate budget from low-ROI channels (like YouTube awareness formats) and reinvest into Facebook Retargeting and Google Search generic keywords.
3. **Responsive Ad Layouts:** Implement responsive, mobile-specific conversion forms to bridge mobile sign-up-to-purchase hurdles.
