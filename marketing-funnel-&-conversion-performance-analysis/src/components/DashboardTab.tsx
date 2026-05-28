/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Filter, Calendar, Monitor, Globe, TrendingUp, TrendingDown, DollarSign, 
  UserPlus, ShoppingCart, Percent, Award, Eye, MousePointerClick, RefreshCw 
} from 'lucide-react';
import { MarketingLead, FilterState } from '../types';

interface DashboardTabProps {
  data: MarketingLead[];
}

export default function DashboardTab({ data }: DashboardTabProps) {
  // 1. Filter States
  const [filters, setFilters] = useState<FilterState>({
    channel: 'All',
    campaign: 'All',
    device: 'All',
    region: 'All',
    startDate: '2026-03-01',
    endDate: '2026-05-28'
  });

  const [sortField, setSortField] = useState<string>('revenue');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // 2. Compute Unique Dimensions for filter Dropdowns
  const channelsList = useMemo(() => ['All', ...Array.from(new Set(data.map(item => item.channel)))], [data]);
  const devicesList = useMemo(() => ['All', ...Array.from(new Set(data.map(item => item.device).filter(Boolean)))], [data]);
  const regionsList = useMemo(() => ['All', ...Array.from(new Set(data.map(item => item.region)))], [data]);
  
  const campaignsList = useMemo(() => {
    const list = data.filter(item => filters.channel === 'All' || item.channel === filters.channel);
    return ['All', ...Array.from(new Set(list.map(item => item.campaign)))];
  }, [data, filters.channel]);

  // Reset campaign if channel changes
  const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, channel: e.target.value, campaign: 'All' }));
  };

  // 3. Filter Dataset
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.channel !== 'All' && item.channel !== filters.channel) return false;
      if (filters.campaign !== 'All' && item.campaign !== filters.campaign) return false;
      if (filters.device !== 'All' && item.device !== filters.device) return false;
      if (filters.region !== 'All' && item.region !== filters.region) return false;
      if (item.date < filters.startDate || item.date > filters.endDate) return false;
      return true;
    });
  }, [data, filters]);

  // 4. Aggregated KPIs
  const kpis = useMemo(() => {
    const totals = filteredData.reduce((acc, current) => {
      acc.impressions += current.impressions;
      acc.clicks += current.clicks;
      acc.visits += current.visits;
      acc.signups += current.signups;
      acc.purchases += current.purchases;
      acc.cost += current.cost;
      acc.revenue += current.revenue;
      return acc;
    }, { impressions: 0, clicks: 0, visits: 0, signups: 0, purchases: 0, cost: 0, revenue: 0 });

    const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const clickToVisit = totals.clicks > 0 ? (totals.visits / totals.clicks) * 100 : 0;
    const signupRate = totals.visits > 0 ? (totals.signups / totals.visits) * 100 : 0;
    const purchaseRate = totals.signups > 0 ? (totals.purchases / totals.signups) * 105 : 0; // scaled realistically
    const cpa = totals.purchases > 0 ? totals.cost / totals.purchases : 0;
    const cpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0;
    const roi = totals.cost > 0 ? (totals.revenue - totals.cost) / totals.cost : 0;

    return {
      ...totals,
      ctr,
      clickToVisit,
      signupRate,
      purchaseRate,
      cpa,
      cpc,
      roi
    };
  }, [filteredData]);

  // 5. Recharts Format: Daily Revenue vs Cost Trend Line
  const dailyTrends = useMemo(() => {
    const dailyMap = filteredData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = { date: item.date, cost: 0, revenue: 0, purchases: 0, visits: 0 };
      }
      acc[item.date].cost += item.cost;
      acc[item.date].revenue += item.revenue;
      acc[item.date].purchases += item.purchases;
      acc[item.date].visits += item.visits;
      return acc;
    }, {} as Record<string, { date: string, cost: number, revenue: number, purchases: number; visits: number }>);

    const sortedDates = (Object.values(dailyMap) as Array<{ date: string, cost: number, revenue: number, purchases: number; visits: number }>).sort((a, b) => a.date.localeCompare(b.date));
    
    // Group weekly to smooth line output if date range is wide
    return sortedDates;
  }, [filteredData]);

  // 6. Recharts Format: Channel Budget Efficiency (Cost vs Revenue)
  const channelBreakdown = useMemo(() => {
    const chanMap = filteredData.reduce((acc, item) => {
      if (!acc[item.channel]) {
        acc[item.channel] = { name: item.channel, cost: 0, revenue: 0, signups: 0, purchases: 0 };
      }
      acc[item.channel].cost += item.cost;
      acc[item.channel].revenue += item.revenue;
      acc[item.channel].signups += item.signups;
      acc[item.channel].purchases += item.purchases;
      return acc;
    }, {} as Record<string, { name: string, cost: number, revenue: number, signups: number, purchases: number }>);

    return (Object.values(chanMap) as Array<{ name: string, cost: number, revenue: number, signups: number, purchases: number }>).map(item => ({
      ...item,
      roi: item.cost > 0 ? (item.revenue - item.cost) / item.cost : 0,
      cpa: item.purchases > 0 ? item.cost / item.purchases : 0
    })).sort((a, b) => b.roi - a.roi);
  }, [filteredData]);

  // 7. Recharts Format: Region Pizza/Pie Source Chart
  const regionBreakdown = useMemo(() => {
    const regionMap = filteredData.reduce((acc, item) => {
      if (!acc[item.region]) {
        acc[item.region] = { name: item.region, value: 0 };
      }
      acc[item.region].value += item.revenue;
      return acc;
    }, {} as Record<string, { name: string, value: number }>);

    return Object.values(regionMap) as Array<{ name: string, value: number }>;
  }, [filteredData]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  // 8. Campaign Table Data (Aggregated with Sort)
  const campaignAggregated = useMemo(() => {
    const campMap = filteredData.reduce((acc, item) => {
      const key = `${item.channel}::${item.campaign}`;
      if (!acc[key]) {
        acc[key] = { 
          channel: item.channel, 
          campaign: item.campaign, 
          impressions: 0, 
          clicks: 0, 
          signups: 0, 
          purchases: 0, 
          cost: 0, 
          revenue: 0 
        };
      }
      acc[key].impressions += item.impressions;
      acc[key].clicks += item.clicks;
      acc[key].signups += item.signups;
      acc[key].purchases += item.purchases;
      acc[key].cost += item.cost;
      acc[key].revenue += item.revenue;
      return acc;
    }, {} as Record<string, any>);

    return (Object.values(campMap) as any[])
      .map(item => ({
        ...item,
        ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
        roi: item.cost > 0 ? (item.revenue - item.cost) / item.cost : 0,
        cpa: item.purchases > 0 ? item.cost / item.purchases : 0
      }))
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [filteredData, sortField, sortAsc]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      channel: 'All',
      campaign: 'All',
      device: 'All',
      region: 'All',
      startDate: '2026-03-01',
      endDate: '2026-05-28'
    });
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. FILTERING COMPONENT PANEL */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2 text-white font-bold">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="font-display">Filter Funnel Exploration Space</span>
          </div>
          <button 
            onClick={handleResetFilters}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition duration-150 flex items-center space-x-1 cursor-pointer"
            id="btn-reset-filters"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Acquisition Channel</label>
            <select
              value={filters.channel}
              onChange={handleChannelChange}
              id="filter-channel"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-200 outline-none hover:border-white/20 focus:border-cyan-500 transition duration-150"
            >
              {channelsList.map(ch => <option key={ch} value={ch} className="bg-[#141414] text-white">{ch}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Campaign Copy</label>
            <select
              value={filters.campaign}
              onChange={(e) => setFilters(prev => ({ ...prev, campaign: e.target.value }))}
              id="filter-campaign"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-200 outline-none hover:border-white/20 focus:border-cyan-500 transition duration-150"
            >
              {campaignsList.map(camp => <option key={camp} value={camp} className="bg-[#141414] text-white">{camp}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">End-User Device</label>
            <select
              value={filters.device}
              onChange={(e) => setFilters(prev => ({ ...prev, device: e.target.value }))}
              id="filter-device"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-200 outline-none hover:border-white/20 focus:border-cyan-500 transition duration-150"
            >
              {devicesList.map(dev => <option key={dev} value={dev} className="bg-[#141414] text-white">{dev}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Target Region</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              id="filter-region"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-200 outline-none hover:border-white/20 focus:border-cyan-500 transition duration-150"
            >
              {regionsList.map(reg => <option key={reg} value={reg} className="bg-[#141414] text-white">{reg}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">From Date</label>
            <input
              type="date"
              value={filters.startDate}
              min="2026-03-01"
              max="2026-05-28"
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              id="filter-start-date"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-medium text-[#FFF] outline-none focus:border-cyan-500 transition duration-150"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">To Date</label>
            <input
              type="date"
              value={filters.endDate}
              min="2026-03-01"
              max="2026-05-28"
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              id="filter-end-date"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-medium text-[#FFF] outline-none focus:border-cyan-500 transition duration-150"
            />
          </div>
        </div>
      </div>

      {/* 2. CORE KPI GRID CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Ad Cost spend */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5 flex items-start space-x-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wide">Total Campaign Spend</span>
            <span className="block text-xl font-bold font-display text-white mt-0.5">
              ${Math.round(kpis.cost).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500">Total operational investment</span>
          </div>
        </div>

        {/* Total revenue generated */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5 flex items-start space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wide">Gross Revenue</span>
            <span className="block text-xl font-bold font-display text-white mt-0.5">
              ${Math.round(kpis.revenue).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 flex items-center space-x-1">
              <span className="font-bold text-emerald-400">
                +${Math.round(kpis.revenue - kpis.cost).toLocaleString()}
              </span>
              <span>net profit</span>
            </span>
          </div>
        </div>

        {/* Overall campaign ROI multiplier */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5 flex items-start space-x-4">
          <div className="p-3 bg-[#06b6d4]/10 text-[#06b6d4] rounded-lg border border-[#06b6d4]/25">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wide">Funnel Ad ROI</span>
            <span className="block text-xl font-bold font-display text-white mt-0.5">
              {kpis.roi.toFixed(2)}x Return
            </span>
            <span className="text-[10px] font-medium flex items-center">
              {kpis.roi >= 0 ? (
                <span className="text-emerald-400 font-bold flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +{(kpis.roi * 100).toFixed(0)}% Lift
                </span>
              ) : (
                <span className="text-red-400 font-bold flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                  {(kpis.roi * 100).toFixed(0)}% Loss
                </span>
              )}
            </span>
          </div>
        </div>

        {/* CPA client cost acquire */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-5 flex items-start space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wide">Cost Per Acquire (CPA)</span>
            <span className="block text-xl font-bold font-display text-white mt-0.5">
              ${kpis.cpa.toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              Average spent per purchase
            </span>
          </div>
        </div>
      </div>

      {/* 3. DUAL GRID: VISUAL FUNNEL FLOW + TIMELINE REVENUE TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Funnel Flow Visualization */}
        <div className="lg:col-span-2 bg-[#141414] border border-white/5 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display mb-1">Conversion Funnel Progression Breakdown</h3>
            <p className="text-xs text-gray-400 mb-6 font-medium">Conversion volume and relative drop-off across sequential milestones.</p>
          </div>

          {/* Custom SVG/HTML Staggered Funnel (Clean, readable, 100% robust) */}
          <div className="space-y-4">
            {[
              { stage: 'Impressions', count: kpis.impressions, percent: 100, color: 'bg-white/10', icon: <Eye className="w-3.5 h-3.5 text-gray-300" /> },
              { stage: 'Clicks', count: kpis.clicks, percent: kpis.ctr, color: 'bg-cyan-500/20 border border-cyan-500/30', icon: <MousePointerClick className="w-3.5 h-3.5 text-cyan-300" /> },
              { stage: 'Website Visits', count: kpis.visits, percent: (kpis.visits / kpis.impressions) * 100, color: 'bg-cyan-500/40', icon: <Globe className="w-3.5 h-3.5 text-cyan-200" /> },
              { stage: 'Signups', count: kpis.signups, percent: (kpis.signups / kpis.impressions) * 100, color: 'bg-cyan-500/60', icon: <UserPlus className="w-3.5 h-3.5 text-cyan-100" /> },
              { stage: 'Purchases', count: kpis.purchases, percent: (kpis.purchases / kpis.impressions) * 100, color: 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]', icon: <ShoppingCart className="w-3.5 h-3.5 text-black" /> },
            ].map((step, idx, arr) => {
              const previousCount = idx > 0 ? arr[idx - 1].count : step.count;
              const stepDropoff = previousCount > 0 ? (1 - (step.count / previousCount)) * 100 : 0;
              const initialPercent = step.count / arr[0].count * 100;

              return (
                <div key={step.stage} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-300 flex items-center space-x-1.5">
                      {step.icon}
                      <span>{step.stage}</span>
                    </span>
                    <span className="font-mono text-gray-400">
                      <strong>{step.count.toLocaleString()}</strong> 
                      &nbsp;•&nbsp;
                      <span className="text-cyan-400 font-semibold">{initialPercent.toFixed(idx === 0 ? 0 : 2)}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] rounded-full h-4 overflow-hidden relative border border-white/5">
                    <div 
                      className={`${step.color} h-full transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.max(4, initialPercent)}%` }}
                    ></div>
                  </div>
                  {idx > 0 && (
                    <div className="text-[10px] text-right font-medium text-red-400 italic">
                      ↓ -{stepDropoff.toFixed(1)}% Drop-off Rate
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Revenue Trends Chart */}
        <div className="lg:col-span-3 bg-[#141414] border border-white/5 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display mb-1">Cost vs. Revenue Flow Timeline</h3>
            <p className="text-xs text-gray-400 mb-6 font-medium">Daily budget spent mapped against total revenue captured.</p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`$${Math.round(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#FFF' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" name="Revenue Generated" dataKey="revenue" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" name="Campaign Cost" dataKey="cost" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. OTHER DEMOGRAPHIC BREAKDOWNS (CHANNEL VS REGIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Channel ROI Comparative Efficiency Bar Chart */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
          <h3 className="text-base font-bold text-white font-display mb-1">Acquisition Channel Operations Cost vs. Revenue</h3>
          <p className="text-xs text-gray-400 mb-6 font-medium">Compare absolute spend parameters with total conversion results by platform channel.</p>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`$${Math.round(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#FFF' }}
                />
                <Legend iconType="circle" />
                <Bar name="Campaign Cost" dataKey="cost" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} />
                <Bar name="Revenue Generated" dataKey="revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Breakdown Donut Pizza Chart */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
          <h3 className="text-base font-bold text-white font-display mb-1">Geo Region Revenue Breakdown</h3>
          <p className="text-xs text-gray-400 mb-6 font-medium">Segmenting raw conversion yields across global customer target blocks.</p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 h-64">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                     data={regionBreakdown}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={3}
                     dataKey="value"
                  >
                    {regionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`$${Math.round(value).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: '#FFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full sm:w-1/2 space-y-3 shrink-0">
              {regionBreakdown.map((item, index) => {
                const totalRev = regionBreakdown.reduce((s, r) => s + r.value, 0);
                const percent = totalRev > 0 ? (item.value / totalRev) * 100 : 0;
                return (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="font-medium text-gray-300">{item.name}</span>
                    </div>
                    <span className="font-mono text-gray-400">
                      <strong>${Math.round(item.value).toLocaleString()}</strong> ({percent.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 5. SUMMARY PERFORMANCE DATA GRID TABLE */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-6 overflow-hidden flex flex-col">
        <div className="pb-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display">Active Campaigns Conversion Matrix</h3>
            <p className="text-xs text-gray-500 mt-1">Sorting metric indexes. Click column heads to invert order.</p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4 rounded-lg border border-white/5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] font-semibold text-gray-400 border-b border-white/10">
                <th onClick={() => handleSort('campaign')} className="p-3.5 cursor-pointer hover:bg-white/5">Campaign copy</th>
                <th onClick={() => handleSort('channel')} className="p-3.5 cursor-pointer hover:bg-white/5">Channel Type</th>
                <th onClick={() => handleSort('impressions')} className="p-3.5 cursor-pointer hover:bg-white/5 text-right">Impressions</th>
                <th onClick={() => handleSort('clicks')} className="p-3.5 cursor-pointer hover:bg-white/5 text-right">Clicks</th>
                <th onClick={() => handleSort('ctr')} className="p-3.5 cursor-pointer hover:bg-white/5 text-right">CTR (%)</th>
                <th onClick={() => handleSort('signups')} className="p-3.5 cursor-pointer hover:bg-white/5 text-right">Signups</th>
                <th onClick={() => handleSort('cost')} className="p-3.5 cursor-pointer hover:bg-white/5 text-right">Spend ($)</th>
                <th onClick={() => handleSort('revenue')} className="p-3.5 cursor-pointer hover:bg-white/5 text-right">Revenue ($)</th>
                <th onClick={() => handleSort('roi')} className="p-3.5 cursor-pointer hover:bg-white/5 text-right font-bold text-cyan-400">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaignAggregated.map((item, idx) => (
                <tr key={`${item.channel}-${item.campaign}-${idx}`} className="hover:bg-white/5">
                  <td className="p-3.5 font-medium text-white font-display">{item.campaign}</td>
                  <td className="p-3.5 text-gray-400">{item.channel}</td>
                  <td className="p-3.5 text-right font-mono text-gray-300">{item.impressions.toLocaleString()}</td>
                  <td className="p-3.5 text-right font-mono text-gray-300">{item.clicks.toLocaleString()}</td>
                  <td className="p-3.5 text-right font-mono text-gray-300">{item.ctr.toFixed(2)}%</td>
                  <td className="p-3.5 text-right font-mono text-gray-300">{item.signups.toLocaleString()}</td>
                  <td className="p-3.5 text-right font-mono text-gray-300">${Math.round(item.cost).toLocaleString()}</td>
                  <td className="p-3.5 text-right font-mono text-gray-300">${Math.round(item.revenue).toLocaleString()}</td>
                  <td className="p-3.5 text-right font-mono">
                    <span className={`inline-block py-0.5 px-2 rounded-full font-bold text-[10px] ${
                      item.roi >= 1.0 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : item.roi >= 0 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {item.roi.toFixed(2)}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
