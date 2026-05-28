import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from scipy import stats

st.set_page_config(page_title="Marketing Conversion & Funnel Analyzer", layout="wide", page_icon="📊")

@st.cache_data
def load_and_clean_data():
    # Reading generated cleaned file or building direct sample
    try:
        df = pd.read_csv('marketing_dataset_clean.csv')
    except Exception:
        # Fallback to importing generated data
        from analytics import generate_synthetic_data, clean_and_prepare_data
        df = clean_and_prepare_data(generate_synthetic_data())
    df['Date'] = pd.to_datetime(df['Date'])
    return df

# Main Header
st.title("🎯 Marketing Funnel & Conversion Performance Analytics Dashboard")
st.markdown("---")

df = load_and_clean_data()

# Sidebar Filters
st.sidebar.header("🎯 Interactive Filtering Panel")
available_channels = ['All'] + sorted(df['Marketing Channel'].unique().tolist())
selected_channel = st.sidebar.selectbox("Filter by Acquisition Channel", available_channels)

available_devices = ['All'] + sorted(df['Device Type'].unique().tolist())
selected_device = st.sidebar.selectbox("Filter by End-User Device", available_devices)

available_regions = ['All'] + sorted(df['Region'].unique().tolist())
selected_region = st.sidebar.selectbox("Filter by Target Region", available_regions)

# Date slider
min_date = df['Date'].min().to_pydatetime()
max_date = df['Date'].max().to_pydatetime()
start_date, end_date = st.sidebar.slider(
    "Date Filter Range", 
    min_value=min_date, 
    max_value=max_date, 
    value=(min_date, max_date)
)

# Apply filters
filtered_df = df.copy()
if selected_channel != 'All':
    filtered_df = filtered_df[filtered_df['Marketing Channel'] == selected_channel]
if selected_device != 'All':
    filtered_df = filtered_df[filtered_df['Device Type'] == selected_device]
if selected_region != 'All':
    filtered_df = filtered_df[filtered_df['Region'] == selected_region]
filtered_df = filtered_df[(filtered_df['Date'] >= start_date) & (filtered_df['Date'] <= end_date)]

# ----------------- KPI Cards -----------------
st.subheader("💡 Aggregated Performance Indicators")
col1, col2, col3, col4, col5 = st.columns(5)

total_spend = filtered_df['Campaign Cost'].sum()
total_revenue = filtered_df['Revenue Generated'].sum()
total_purchases = filtered_df['Purchases'].sum()
total_clicks = filtered_df['Clicks'].sum()
total_impressions = filtered_df['Impressions'].sum()

ctr = (total_clicks / total_impressions) * 100 if total_impressions > 0 else 0
cpa = total_spend / total_purchases if total_purchases > 0 else 0
roi = (total_revenue - total_spend) / total_spend if total_spend > 0 else 0

with col1:
    st.metric("Total Ad Cost", f"${total_spend:,.2f}")
with col2:
    st.metric("Gross Revenue", f"${total_revenue:,.2f}")
with col3:
    st.metric("Conversion ROI", f"{roi:.2f}x", delta=f"{(roi*100):.1f}%")
with col4:
    st.metric("Click-Through Rate (CTR)", f"{ctr:.2f}%")
with col5:
    st.metric("Cost Per Acquisition (CPA)", f"${cpa:.2f}")

st.markdown("---")

# ----------------- Visualizations -----------------
g1, g2 = st.columns([1, 1])

with g1:
    st.subheader("📊 Conversion Funnel Progression")
    # Generate aggregated values for the funnel
    agg_funnel = filtered_df[['Impressions', 'Clicks', 'Website Visits', 'Signups', 'Purchases']].sum().reset_index()
    agg_funnel.columns = ['Stage', 'UsersCount']
    
    # Calculate conversion metrics
    agg_funnel['% of Impressions'] = (agg_funnel['UsersCount'] / agg_funnel.iloc[0]['UsersCount'] * 100).round(2)
    
    fig_funnel = go.Figure(go.Funnel(
        y=agg_funnel['Stage'],
        x=agg_funnel['UsersCount'],
        textinfo="value+percent initial+percent previous",
        marker={"color": ["#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"]}
    ))
    fig_funnel.update_layout(margin=dict(l=15, r=15, t=10, b=10), height=380)
    st.plotly_chart(fig_funnel, use_container_width=True)

with g2:
    st.subheader("📈 Revenue vs Cost Over Timeline")
    trend_df = filtered_df.groupby('Date')[['Campaign Cost', 'Revenue Generated']].sum().reset_index()
    fig_trend = px.line(trend_df, x='Date', y=['Campaign Cost', 'Revenue Generated'],
                        labels={'value': 'USD ($)', 'variable': 'Value Type'},
                        color_discrete_map={'Campaign Cost': '#ef4444', 'Revenue Generated': '#10b981'})
    fig_trend.update_layout(legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1), height=380)
    st.plotly_chart(fig_trend, use_container_width=True)

st.markdown("---")

c_col1, c_col2 = st.columns(2)

with c_col1:
    st.subheader("🚀 Operational Efficiency by Marketing Channel")
    channel_perf = filtered_df.groupby('Marketing Channel').agg({
        'Campaign Cost': 'sum',
        'Revenue Generated': 'sum'
    }).reset_index()
    fig_chan = px.bar(channel_perf, x='Marketing Channel', y=['Campaign Cost', 'Revenue Generated'],
                      barmode='group', color_discrete_sequence=['#3b82f6', '#10b981'],
                      labels={'value': 'USD ($)', 'variable': 'Budget Type'})
    st.plotly_chart(fig_chan, use_container_width=True)

with c_col2:
    st.subheader("🌎 Regional Revenue Performance Breakdown")
    region_perf = filtered_df.groupby('Region')['Revenue Generated'].sum().reset_index()
    fig_pie = px.pie(region_perf, names='Region', values='Revenue Generated',
                     color_discrete_sequence=px.colors.sequential.Tealgrn,
                     hole=0.45)
    fig_pie.update_layout(margin=dict(l=10, r=10, t=10, b=10))
    st.plotly_chart(fig_pie, use_container_width=True)

# ----------------- Advanced Statistics -----------------
st.markdown("---")
st.subheader("🧪 Advanced Analytics & Statistical Confidence Check (A/B Test)")

ab_col1, ab_col2 = st.columns([1, 2])

with ab_col1:
    st.markdown("""
    **Experiment Scenario: Landing Page Redesign**
    We tested two variations of campaign copy to improve final signup rates:
    *   **Landing Page A (Baseline)**: Explains product dashboard structure.
    *   **Landing Page B (Benefit-driven)**: Showcases final conversion uplift statistics.
    """)
    st.info("The Z-Ratio/T-Test checks if the conversion lift is statistically significant (p < 0.05).")

with ab_col2:
    v_a, s_a = st.slider("Visitors (LP A)", 5000, 20000, 12050), st.slider("Signups (LP A)", 100, 1000, 482)
    v_b, s_b = st.slider("Visitors (LP B)", 5000, 20000, 11980), st.slider("Signups (LP B)", 100, 1000, 563)
    
    p_a = s_a / v_a
    p_b = s_b / v_b
    pooled_p = (s_a + s_b) / (v_a + v_b)
    
    se = np.sqrt(pooled_p * (1 - pooled_p) * (1/v_a + 1/v_b))
    z_score = (p_b - p_a) / se
    p_val = stats.norm.sf(abs(z_score)) * 2
    
    st.write(f"**Landing Page A Ratio:** {p_a:.2%} | **Landing Page B Ratio:** {p_b:.2%}")
    st.write(f"**Computed Z-Stat Ratio:** `{z_score:.4f}` | **P-Value Confidence Ratio:** `{p_val:.6f}`")
    
    if p_val < 0.05:
        st.success("🎉 STATISTICALLY SIGNIFICANT! Reject the Null Hypothesis. Landing Page B converts visitors better.")
    else:
        st.warning("⚠️ NOT Statistically Significant. The difference could be due to random variance.")
