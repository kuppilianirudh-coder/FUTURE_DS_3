/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketingLead } from "./types";

const CHANNELS = [
  { name: 'Google Search', conversionsMultiplier: 1.2, costMultiplier: 1.0, ctr: 0.08, signupRate: 0.15, purchaseRate: 0.12 },
  { name: 'Facebook Ads', conversionsMultiplier: 0.95, costMultiplier: 1.2, ctr: 0.03, signupRate: 0.10, purchaseRate: 0.07 },
  { name: 'LinkedIn CRM', conversionsMultiplier: 1.6, costMultiplier: 2.2, ctr: 0.015, signupRate: 0.25, purchaseRate: 0.20 },
  { name: 'YouTube Video', conversionsMultiplier: 0.8, costMultiplier: 1.5, ctr: 0.02, signupRate: 0.08, purchaseRate: 0.04 },
  { name: 'Email Newsletter', conversionsMultiplier: 1.4, costMultiplier: 0.15, ctr: 0.12, signupRate: 0.18, purchaseRate: 0.15 },
  { name: 'Organic Search', conversionsMultiplier: 1.1, costMultiplier: 0.0, ctr: 0.06, signupRate: 0.12, purchaseRate: 0.10 }
];

const CAMPAIGNS: Record<string, string[]> = {
  'Google Search': ['Brand Paid search', 'Competitor Conquesting', 'Generic Keywords Mid-Funnel'],
  'Facebook Ads': ['Spring Promo 2026', 'Lookalike Audience LAL-1%', 'Retargeting Wave 1'],
  'LinkedIn CRM': ['Enterprise Decision Makers', 'B2B Tech Lead Gen'],
  'YouTube Video': ['Product Explainer Video', 'Customer Testimonial Story'],
  'Email Newsletter': ['Newsletter Weekly', 'Welcome Nurture Series'],
  'Organic Search': ['SEO Resource Blog', 'Landing Page Directory']
};

const DEVICES = ['Desktop', 'Mobile', 'Tablet'];
const REGIONS = ['North America', 'Europe', 'Asia-Pacific', 'Latin America'];

// Generate reproducible synthetic dataset
export function generateRawMarketingData(seed = 42): MarketingLead[] {
  const data: MarketingLead[] = [];
  let idCounter = 10001;

  // Visual helper to generate pseudo-random numbers with a seed
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Generate 85 days of marketing campaign data
  const startDate = new Date('2026-03-01');
  const days = 85;

  for (let d = 0; d < days; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);
    const dateStr = currentDate.toISOString().split('T')[0];

    CHANNELS.forEach((channelInfo) => {
      const campaigns = CAMPAIGNS[channelInfo.name];
      campaigns.forEach((campName) => {
        REGIONS.forEach((region) => {
          DEVICES.forEach((device) => {
            // Adjust volume based on day of week and seed
            const dayOfWeek = currentDate.getDay();
            const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.75 : 1.1;
            const regionMultiplier = region === 'North America' ? 1.3 : (region === 'Asia-Pacific' ? 1.0 : 0.82);
            const baseVol = 300 + Math.floor(random() * 800);
            
            // Generate Impressions
            const impressions = Math.floor(baseVol * weekendMultiplier * regionMultiplier);
            
            // Clicks derived from CTR
            const clicks = Math.floor(impressions * channelInfo.ctr * (0.85 + random() * 0.3));
            
            // Visits derived from Clicks (usually 85%-95% of clicks make it to final visit load)
            const visits = Math.floor(clicks * (0.85 + random() * 0.1));
            
            // Signups derived from signupRate
            const signups = Math.floor(visits * channelInfo.signupRate * channelInfo.conversionsMultiplier * (0.8 + random() * 0.4));
            
            // Purchases derived from purchaseRate
            const purchases = Math.floor(signups * channelInfo.purchaseRate * channelInfo.conversionsMultiplier * (0.75 + random() * 0.5));
            
            // Costs calculations: channel specific base rate per click-through (CPC) or impressions (CPM)
            let cost = 0;
            if (channelInfo.name !== 'Organic Search') {
              const baseCostPerClick = channelInfo.name === 'LinkedIn CRM' ? 6.5 : (channelInfo.name === 'Google Search' ? 1.8 : 1.25);
              cost = Math.round(clicks * baseCostPerClick * channelInfo.costMultiplier * (0.9 + random() * 0.2));
            }

            // Revenue calculation: Each purchase averages $120 spent with standard variance
            const avgOrderValue = 125;
            const revenue = Math.round(purchases * avgOrderValue * (0.9 + random() * 0.22));

            data.push({
              leadId: `L-${idCounter++}`,
              channel: channelInfo.name,
              campaign: campName,
              impressions,
              clicks,
              visits,
              signups,
              purchases,
              cost,
              revenue,
              device,
              region,
              date: dateStr
            });
          });
        });
      });
    });
  }

  // Infuse data anomalies/defects (Data Science specific cleaning scenario) Let's introduce ~12% data defects
  const dataWithDefects = data.map((item, index) => {
    const newItem = { ...item };
    
    // 1. Missing Values (Imputed or discarded in cleaning phase)
    if (index % 47 === 0) {
      newItem.device = ''; // Empty string represents missing data
      newItem.hasMissingFields = true;
    }

    // 2. Outliers (e.g., Campaign Cost spike dramatically due to dashboard telemetry issue or manual tracking error)
    if (index === 150 || index === 450 || index === 850) {
      newItem.cost = newItem.cost * 18; // Cost outlier
      newItem.isOutlier = true;
    }
    if (index === 200 || index === 600) {
      newItem.revenue = newItem.revenue * 22; // Revenue outlier
      newItem.isOutlier = true;
    }

    // 3. String formatting/Standardization issue
    if (index % 59 === 0) {
      // Date formatting issues (e.g. Month/Day/Year or timestamp anomalies instead of YYYY-MM-DD)
      const parts = newItem.date.split('-');
      if (parts.length === 3) {
        newItem.date = `${parts[1]}/${parts[2]}/${parts[0]}`; // MM/DD/YYYY
      }
    }

    return newItem;
  });

  // 4. Duplicate Records (Will be removed by Pandas equivalent)
  const duplicates: MarketingLead[] = [];
  dataWithDefects.forEach((item, index) => {
    if (index > 0 && index % 120 === 0) {
      duplicates.push({
        ...item,
        leadId: item.leadId + '-DUPE', // Duplicate but slightly labeled, or same ID
        isDuplicate: true
      });
    }
  });

  return [...dataWithDefects, ...duplicates];
}

// Emulate a Python Pandas pipeline to clean the dataset
export interface CleaningLog {
  duplicatesRemoved: number;
  missingValuesFixed: number;
  outliersCapped: number;
  datesStandardized: number;
  originalCount: number;
  cleanedCount: number;
}

export function runDataCleaningPipeline(rawData: MarketingLead[]): { cleanedData: MarketingLead[], log: CleaningLog } {
  let duplicatesRemoved = 0;
  let missingValuesFixed = 0;
  let outliersCapped = 0;
  let datesStandardized = 0;
  
  const originalCount = rawData.length;
  const uniqueRecordsMap = new Map<string, MarketingLead>();

  // Deduplicate and process
  rawData.forEach((item) => {
    const cleanItem = { ...item };

    // 1. Detect duplicates
    const lookupKey = `${cleanItem.campaign}-${cleanItem.date}-${cleanItem.device}-${cleanItem.region}`;
    if (cleanItem.isDuplicate || uniqueRecordsMap.has(lookupKey)) {
      duplicatesRemoved++;
      return; // Skip adding duplicates (removes them, like df.drop_duplicates())
    }

    // 2. Handle missing device info (imputation with 'Unknown' or mode)
    if (!cleanItem.device || cleanItem.device.trim() === '') {
      cleanItem.device = 'Desktop'; // Impute mode 'Desktop'
      missingValuesFixed++;
    }

    // 3. Standardize dates
    if (cleanItem.date.includes('/')) {
      const parts = cleanItem.date.split('/');
      if (parts.length === 3) {
        // MM/DD/YYYY -> YYYY-MM-DD
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        cleanItem.date = `${year}-${month}-${day}`;
        datesStandardized++;
      }
    }

    // 4. Outlier handling (clipping outliers beyond standard distribution 3*IQR, or capping extreme values)
    if (cleanItem.isOutlier) {
      // If cost is extremely high Relative to clicks
      if (cleanItem.cost > cleanItem.clicks * 40 && cleanItem.clicks > 0) {
        cleanItem.cost = Math.round(cleanItem.clicks * 1.8 * 1.5); // Cap to standard level
        outliersCapped++;
      }
      // If revenue is extremely high relative to purchases
      if (cleanItem.revenue > cleanItem.purchases * 2000 && cleanItem.purchases > 0) {
        cleanItem.revenue = Math.round(cleanItem.purchases * 125 * 1.1); // Recalculate robustly
        outliersCapped++;
      }
    }

    // Ensure all metrics are positive
    cleanItem.cost = Math.max(0, cleanItem.cost);
    cleanItem.revenue = Math.max(0, cleanItem.revenue);

    uniqueRecordsMap.set(lookupKey, cleanItem);
  });

  const cleanedData = Array.from(uniqueRecordsMap.values());
  const cleanedCount = cleanedData.length;

  return {
    cleanedData: cleanedData.sort((a, b) => a.date.localeCompare(b.date)),
    log: {
      duplicatesRemoved,
      missingValuesFixed,
      outliersCapped,
      datesStandardized,
      originalCount,
      cleanedCount
    }
  };
}
