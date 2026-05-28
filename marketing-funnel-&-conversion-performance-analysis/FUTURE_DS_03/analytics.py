#!/usr/bin/env python3
"""
Marketing Funnel & Conversion Performance Analysis
Repository: FUTURE_DS_03
Author: Data Science Team
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

def generate_synthetic_data(num_days=90, random_seed=42):
    """
    Generates a realistic raw marketing dataset with intentional anomalies for cleaning.
    """
    np.random.seed(random_seed)
    
    channels = {
        'Google Search': {'ctr': 0.08, 'signup_rate': 0.15, 'purchase_rate': 0.12, 'cost_multiplier': 1.0, 'conv_multiplier': 1.2},
        'Facebook Ads': {'ctr': 0.03, 'signup_rate': 0.10, 'purchase_rate': 0.07, 'cost_multiplier': 1.2, 'conv_multiplier': 0.95},
        'LinkedIn CRM': {'ctr': 0.015, 'signup_rate': 0.25, 'purchase_rate': 0.20, 'cost_multiplier': 2.2, 'conv_multiplier': 1.6},
        'YouTube Video': {'ctr': 0.02, 'signup_rate': 0.08, 'purchase_rate': 0.04, 'cost_multiplier': 1.5, 'conv_multiplier': 0.8},
        'Email Newsletter': {'ctr': 0.12, 'signup_rate': 0.18, 'purchase_rate': 0.15, 'cost_multiplier': 0.15, 'conv_multiplier': 1.4},
        'Organic Search': {'ctr': 0.06, 'signup_rate': 0.12, 'purchase_rate': 0.10, 'cost_multiplier': 0.0, 'conv_multiplier': 1.1}
    }
    
    campaigns = {
        'Google Search': ['Brand Paid search', 'Competitor Conquesting', 'Generic Keywords Mid-Funnel'],
        'Facebook Ads': ['Spring Promo 2026', 'Lookalike Audience LAL-1%', 'Retargeting Wave 1'],
        'LinkedIn CRM': ['Enterprise Decision Makers', 'B2B Tech Lead Gen'],
        'YouTube Video': ['Product Explainer Video', 'Customer Testimonial Story'],
        'Email Newsletter': ['Newsletter Weekly', 'Welcome Nurture Series'],
        'Organic Search': ['SEO Resource Blog', 'Landing Page Directory']
    }
    
    devices = ['Desktop', 'Mobile', 'Tablet']
    regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America']
    
    dates = pd.date_range(start='2026-03-01', periods=num_days, freq='D')
    
    records = []
    lead_id_counter = 10001
    
    for current_date in dates:
        date_str = current_date.strftime('%Y-%m-%d')
        day_of_week = current_date.dayofweek
        weekend_mult = 0.75 if day_of_week >= 5 else 1.1
        
        for channel, params in channels.items():
            for campaign in campaigns[channel]:
                for region in regions:
                    for device in devices:
                        region_mult = 1.3 if region == 'North America' else (1.0 if region == 'Asia-Pacific' else 0.82)
                        base_vol = np.random.randint(300, 1100)
                        
                        impressions = int(base_vol * weekend_mult * region_mult)
                        clicks = int(impressions * params['ctr'] * np.random.uniform(0.85, 1.15))
                        visits = int(clicks * np.random.uniform(0.85, 0.95))
                        signups = int(visits * params['signup_rate'] * params['conv_multiplier'] * np.random.uniform(0.8, 1.2))
                        purchases = int(signups * params['purchase_rate'] * params['conv_multiplier'] * np.random.uniform(0.75, 1.25))
                        
                        cost = 0.0
                        if channel != 'Organic Search':
                          cpc = 6.5 if channel == 'LinkedIn CRM' else (1.8 if channel == 'Google Search' else 1.25)
                          cost = clicks * cpc * params['cost_multiplier'] * np.random.uniform(0.9, 1.1)
                          
                        revenue = purchases * 125.0 * np.random.uniform(0.9, 1.1)
                        
                        records.append({
                            'Lead ID': f"L-{lead_id_counter}",
                            'Marketing Channel': channel,
                            'Campaign Name': campaign,
                            'Impressions': impressions,
                            'Clicks': clicks,
                            'Website Visits': visits,
                            'Signups': signups,
                            'Purchases': purchases,
                            'Campaign Cost': round(cost, 2),
                            'Revenue Generated': round(revenue, 2),
                            'Device Type': device,
                            'Region': region,
                            'Date': date_str
                        })
                        lead_id_counter += 1
                        
    df = pd.DataFrame(records)
    
    # Inject Artificial Anomalies for cleaning demonstration
    # 1. Duplicates
    dup_indices = np.random.choice(df.index, size=int(len(df) * 0.02), replace=False)
    duplicates = df.iloc[dup_indices].copy()
    duplicates['Lead ID'] = duplicates['Lead ID'] + "-DUPE"
    df = pd.concat([df, duplicates], ignore_index=True)
    
    # 2. Missing values
    missing_indices = np.random.choice(df.index, size=int(len(df) * 0.015), replace=False)
    df.loc[missing_indices, 'Device Type'] = np.nan
    
    # 3. Outliers in campaign Cost
    cost_outlier_indices = np.random.choice(df.index, size=3, replace=False)
    df.loc[cost_outlier_indices, 'Campaign Cost'] = df.loc[cost_outlier_indices, 'Campaign Cost'] * 18
    
    # 4. Outliers in Revenue
    rev_outlier_indices = np.random.choice(df.index, size=2, replace=False)
    df.loc[rev_outlier_indices, 'Revenue Generated'] = df.loc[rev_outlier_indices, 'Revenue Generated'] * 22
    
    # 5. Non-standard Date format
    date_alt_indices = np.random.choice(df.index, size=int(len(df) * 0.01), replace=False)
    for idx in date_alt_indices:
        orig = pd.to_datetime(df.loc[idx, 'Date'])
        df.loc[idx, 'Date'] = orig.strftime('%m/%d/%Y')
        
    return df


def clean_and_prepare_data(df):
    """
    Cleans raw dataset matching requirements & standardizes schemas.
    """
    print(f"[*] Raw data shape: {df.shape}")
    cleaned_df = df.copy()
    
    # 1. Remove obvious duplicates
    initial_length = len(cleaned_df)
    cols_to_check = ['Marketing Channel', 'Campaign Name', 'Device Type', 'Region', 'Date']
    cleaned_df = cleaned_df.drop_duplicates(subset=cols_to_check, keep='first')
    print(f"[-] Removed {initial_length - len(cleaned_df)} duplicate rows")
    
    # 2. Correct date formats
    cleaned_df['Date'] = pd.to_datetime(cleaned_df['Date'], errors='coerce')
    print("[-] Date formats standardized to DateTime")
    
    # 3. Handle missing values
    missing_devices = cleaned_df['Device Type'].isna().sum()
    cleaned_df['Device Type'] = cleaned_df['Device Type'].fillna('Desktop')
    print(f"[-] Imputed {missing_devices} missing Device Type records with 'Desktop' (Mode)")
    
    # 4. Outlier detection and Capping (Winsorization/Robust Thresholding)
    # If cost is extremely high relative to clicks, clip it
    # Calculate CPC on active rows to spot outliers
    metric_mask = (cleaned_df['Clicks'] > 10) & (cleaned_df['Campaign Cost'] > 0)
    median_cpc = (cleaned_df.loc[metric_mask, 'Campaign Cost'] / cleaned_df.loc[metric_mask, 'Clicks']).median()
    
    cost_outliers = cleaned_df[cleaned_df['Campaign Cost'] > (cleaned_df['Clicks'] * median_cpc * 10)]
    print(f"[-] Identified {len(cost_outliers)} severe cost outlier anomalies. Capping cost values...")
    cleaned_df.loc[cleaned_df['Campaign Cost'] > (cleaned_df['Clicks'] * median_cpc * 10), 'Campaign Cost'] = \
        cleaned_df['Clicks'] * median_cpc * 1.5
        
    # Same with Revenue
    rev_mask = (cleaned_df['Purchases'] > 0) & (cleaned_df['Revenue Generated'] > 0)
    median_arpu = (cleaned_df.loc[rev_mask, 'Revenue Generated'] / cleaned_df.loc[rev_mask, 'Purchases']).median()
    
    rev_outliers = cleaned_df[cleaned_df['Revenue Generated'] > (cleaned_df['Purchases'] * median_arpu * 10)]
    print(f"[-] Identified {len(rev_outliers)} severe revenue outlier anomalies. Adjusting to standard average value...")
    cleaned_df.loc[cleaned_df['Revenue Generated'] > (cleaned_df['Purchases'] * median_arpu * 10), 'Revenue Generated'] = \
        cleaned_df['Purchases'] * median_arpu
        
    # Standardize numerical datatypes
    cleaned_df['Impressions'] = cleaned_df['Impressions'].astype(int)
    cleaned_df['Clicks'] = cleaned_df['Clicks'].astype(int)
    cleaned_df['Website Visits'] = cleaned_df['Website Visits'].astype(int)
    cleaned_df['Signups'] = cleaned_df['Signups'].astype(int)
    cleaned_df['Purchases'] = cleaned_df['Purchases'].astype(int)
    
    return cleaned_df


def perform_funnel_analysis(df):
    """
    Computes global and channel-wise conversion funnel metrics and budgets.
    """
    total_metrics = df[['Impressions', 'Clicks', 'Website Visits', 'Signups', 'Purchases']].sum()
    
    funnel = pd.DataFrame({
        'Stage': ['Impressions', 'Clicks', 'Website Visits', 'Signups', 'Purchases'],
        'Count': total_metrics.values
    })
    
    # Calculate conversion margins
    funnel['Cumulative Conversion (%)'] = (funnel['Count'] / funnel.loc[0, 'Count'] * 100).round(3)
    funnel['Dropoff Rate (%)'] = 0.0
    for i in range(1, len(funnel)):
        funnel.loc[i, 'Dropoff Rate (%)'] = round((1 - (funnel.loc[i, 'Count'] / funnel.loc[i-1, 'Count'])) * 100, 2)
        
    return funnel


def perform_marketing_kpis(df):
    """
    Calculates essential marketing metrics (CTR, CPC, CPA, ROI) segmented by campaign & channel.
    """
    summary = df.groupby('Marketing Channel').agg({
        'Impressions': 'sum',
        'Clicks': 'sum',
        'Website Visits': 'sum',
        'Signups': 'sum',
        'Purchases': 'sum',
        'Campaign Cost': 'sum',
        'Revenue Generated': 'sum'
    }).reset_index()
    
    summary['CTR (%)'] = round((summary['Clicks'] / summary['Impressions']) * 100, 2)
    summary['CPC ($)'] = round(summary['Campaign Cost'] / summary['Clicks'], 2)
    summary['CPA ($)'] = round(summary['Campaign Cost'] / summary['Purchases'], 2)
    summary['Conversion Rate (%)'] = round((summary['Purchases'] / summary['Website Visits']) * 100, 2)
    summary['ROI'] = np.where(summary['Campaign Cost'] > 0, 
                              round((summary['Revenue Generated'] - summary['Campaign Cost']) / summary['Campaign Cost'], 2), 
                              np.nan)
    summary['Net Margin ($)'] = summary['Revenue Generated'] - summary['Campaign Cost']
    
    return summary


def run_ab_testing_analysis():
    """
    Simulates and runs statistical validation (T-Test/Z-Test) on A/B landing page trials.
    """
    # Landing page A: Conversational | Landing page B: Benefit-Driven
    visitors_A, conversions_A = 12050, 482  # LP-A: 4.0%
    visitors_B, conversions_B = 11980, 563  # LP-B: 4.7%
    
    p_A = conversions_A / visitors_A
    p_B = conversions_B / visitors_B
    p_pooled = (conversions_A + conversions_B) / (visitors_A + visitors_B)
    
    se = np.sqrt(p_pooled * (1 - p_pooled) * (1/visitors_A + 1/visitors_B))
    z_stat = (p_B - p_A) / se
    p_value = stats.norm.sf(abs(z_stat)) * 2 # Two-tailed t-test
    
    print("\n[+] A/B Testing Verification:")
    print(f"    Landing Page A Conv. Rate: {p_A:.4%}")
    print(f"    Landing Page B Conv. Rate: {p_B:.4%}")
    print(f"    Z-Statistic: {z_stat:.4f} | Two-Tailed P-Value: {p_value:.6f}")
    if p_value < 0.05:
        print("    Result: STATISTICALLY SIGNIFICANT. Landing Page B outperforms Page A.")
    else:
        print("    Result: Not statistically significant.")
        
    return {
        'Page A CR': p_A,
        'Page B CR': p_B,
        'Z-stat': z_stat,
        'p-value': p_value,
        'Significant': p_value < 0.05
    }


def export_plots(df, summary, funnel):
    """
    Generates high-quality charts for local storage.
    """
    os.makedirs('reports/figures', exist_ok=True)
    sns.set_theme(style="whitegrid")
    
    # 1. General Funnel Chart
    plt.figure(figsize=(8, 5))
    ax = sns.barplot(x='Count', y='Stage', data=funnel, palette='Blues_r')
    plt.title('Global Marketing Funnel Visualized', fontsize=14, pad=15)
    plt.xlabel('Number of Users')
    plt.ylabel('Funnel progression Stage')
    # Add labels
    for i, p in enumerate(ax.patches):
        width = p.get_width()
        cum_conv = funnel.loc[i, "Cumulative Conversion (%)"]
        ax.text(width + 200, p.get_y() + p.get_height()/2, 
                f'{int(width):,} ({cum_conv}%)', 
                ha="left", va="center", fontsize=10, color='black', fontweight='semibold')
    plt.tight_layout()
    plt.savefig('reports/figures/funnel_performance.png', dpi=150)
    plt.close()
    
    # 2. ROI by Marketing Channel
    plt.figure(figsize=(10, 5))
    roi_data = summary.dropna(subset=['ROI']).sort_values('ROI', ascending=False)
    sns.barplot(x='Marketing Channel', y='ROI', data=roi_data, palette='viridis')
    plt.title('Return on Investment (ROI) by Marketing Channel', fontsize=14, pad=15)
    plt.ylabel('ROI (x Return)')
    plt.xlabel('Marketing Channel')
    plt.tight_layout()
    plt.savefig('reports/figures/channel_roi.png', dpi=150)
    plt.close()
    
    # 3. Monthly Conversion Trend
    df['Date'] = pd.to_datetime(df['Date'])
    monthly_trend = df.resample('W-Mon', on='Date').sum().reset_index()
    monthly_trend['Conversion Rate (%)'] = (monthly_trend['Purchases'] / monthly_trend['Website Visits']) * 100
    
    plt.figure(figsize=(11, 4))
    plt.plot(monthly_trend['Date'], monthly_trend['Conversion Rate (%)'], marker='o', color='#3b82f6', linewidth=2.5)
    plt.fill_between(monthly_trend['Date'], monthly_trend['Conversion Rate (%)'], color='#3b82f6', alpha=0.1)
    plt.title('Weekly Conversion Ratio (Visits-to-Purchase) Trend', fontsize=13, pad=15)
    plt.ylabel('Conversion Rate (%)')
    plt.xlabel('Timeline')
    plt.tight_layout()
    plt.savefig('reports/figures/conversion_trends.png', dpi=150)
    plt.close()
    
    print("[*] Visualizations saved successfully in reports/figures/")


if __name__ == '__main__':
    print("====================================================")
    print("MARKETING FUNNEL & CONVERSION PERFORMANCE PIPELINE  ")
    print("====================================================\n")
    
    # Generate Synthetic Dataset
    raw_data = generate_synthetic_data()
    raw_data.to_csv('marketing_dataset_raw.csv', index=False)
    print(f"[+] Raw Marketing Dataset generated: {len(raw_data)} records exported to 'marketing_dataset_raw.csv'")
    
    # Clean Data
    cleaned_df = clean_and_prepare_data(raw_data)
    cleaned_df.to_csv('marketing_dataset_clean.csv', index=False)
    print(f"[+] Cleaned references exported: 'marketing_dataset_clean.csv'")
    
    # Funnel
    funnel_metrics = perform_funnel_analysis(cleaned_df)
    print("\n[+] Global Funnel Conversion Ratio:")
    print(funnel_metrics.to_string(index=False))
    
    # KPIs
    channel_kpi = perform_marketing_kpis(cleaned_df)
    print("\n[+] Channel Conversion & Financial Efficiency Performance:")
    print(channel_kpi[['Marketing Channel', 'CTR (%)', 'CPC ($)', 'CPA ($)', 'Conversion Rate (%)', 'ROI', 'Net Margin ($)']].to_string(index=False))
    
    # Statistical A/B Validation
    run_ab_testing_analysis()
    
    # Render Plots
    export_plots(cleaned_df, channel_kpi, funnel_metrics)
    print("\n====================================================")
    print("ANALYSIS EXECUTION COMPLETE! READY FOR INTEGRATION")
    print("====================================================")
