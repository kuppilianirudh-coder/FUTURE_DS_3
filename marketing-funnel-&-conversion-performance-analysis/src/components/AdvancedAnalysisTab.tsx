/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sliders, HelpCircle, Check, AlertCircle, Percent, ArrowUpRight, DollarSign, BarChart2 } from 'lucide-react';

export default function AdvancedAnalysisTab() {
  // A/B Test Parameters State
  const [visitorsA, setVisitorsA] = useState<number>(12050);
  const [conversionsA, setConversionsA] = useState<number>(482);
  const [visitorsB, setVisitorsB] = useState<number>(11980);
  const [conversionsB, setConversionsB] = useState<number>(563);

  // Budget Allocation Sliders for optimization simulation
  const [optimizationLevel, setOptimizationLevel] = useState<number>(50); // 0% to 100% reallocation from low ROI to high ROI.

  // ----------------- A/B Testing Math -----------------
  const rateA = visitorsA > 0 ? conversionsA / visitorsA : 0;
  const rateB = visitorsB > 0 ? conversionsB / visitorsB : 0;
  const rawLift = rateA > 0 ? ((rateB - rateA) / rateA) * 100 : 0;

  // Two-sample Z-test for proportions
  const pooledP = (conversionsA + conversionsB) / (visitorsA + visitorsB);
  const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1 / visitorsA + 1 / visitorsB));
  const zScore = standardError > 0 ? (rateB - rateA) / standardError : 0;

  // Approximate P-Value from Z-Score (Two-Tailed Standard Normal CDF approximation)
  const getPValue = (z: number) => {
    const absZ = Math.abs(z);
    // Standard approximation formula for Normal CDF
    const t = 1.0 / (1.0 + 0.2316419 * absZ);
    const d = 0.39894228;
    const p = d * Math.exp(-0.5 * absZ * absZ);
    const cdf = 1.0 - p * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    const twoTailedP = 2 * (1.0 - cdf);
    return Math.min(1.0, Math.max(0.0, twoTailedP));
  };

  const pValue = getPValue(zScore);
  const isSignificant = pValue < 0.05;

  // ----------------- Budget Re-allocation Modeling -----------------
  // Initial Campaign budgets and ROI values
  const initBudgets = [
    { name: 'Google Search', currentCost: 247000, currentRevenue: 345000, roi: 0.39, efficiency: 'High' },
    { name: 'Facebook Ads', currentCost: 195050, currentRevenue: 234050, roi: 0.20, efficiency: 'Moderate' },
    { name: 'LinkedIn CRM', currentCost: 145000, currentRevenue: 218000, roi: 0.50, efficiency: 'High' },
    { name: 'YouTube Video', currentCost: 112000, currentRevenue: 98000, roi: -0.12, efficiency: 'Negative' },
    { name: 'Email Newsletter', currentCost: 11000, currentRevenue: 48000, roi: 3.36, efficiency: 'Excellent' }
  ];

  // Allocate budget based on optimization level (re-allocate YouTube budget mostly into LinkedIn and Email)
  const calculateOptimizedState = () => {
    const reallocatedPercent = optimizationLevel / 100;
    const baseBudgetToMove = initBudgets.find(b => b.name === 'YouTube Video')!.currentCost * reallocatedPercent;

    let predictedRevenueLift = 0;
    let newInvestments = initBudgets.map(chan => {
      let cost = chan.currentCost;
      let rev = chan.currentRevenue;

      if (chan.name === 'YouTube Video') {
        cost -= baseBudgetToMove;
        rev = cost * (1 + chan.roi); // Drop revenue proportional to trimmed cost
      } else if (chan.name === 'Email Newsletter') {
        // High ROI channels pick up the budget
        const share = baseBudgetToMove * 0.25; // 25% to newsletter
        cost += share;
        rev = cost * (1 + 2.85); // conservative ROI of 2.85 for additional budget (diminishing return)
      } else if (chan.name === 'LinkedIn CRM') {
        const share = baseBudgetToMove * 0.45; // 45% to LinkedIn B2B
        cost += share;
        rev = cost * (1 + 0.46); // conservative 46% ROI
      } else if (chan.name === 'Google Search') {
        const share = baseBudgetToMove * 0.3; // 30% to google search
        cost += share;
        rev = cost * (1 + 0.35); // 35% ROI
      }

      predictedRevenueLift += (rev - chan.currentRevenue);
      return {
        ...chan,
        cost,
        revenue: rev,
        newRoi: (rev - cost) / cost
      };
    });

    const totalInitRevenue = initBudgets.reduce((sum, b) => sum + b.currentRevenue, 0);
    const totalNewRevenue = newInvestments.reduce((sum, b) => sum + b.revenue, 0);
    const overallRevenueLift = totalNewRevenue - totalInitRevenue;
    
    return {
      newInvestments,
      overallRevenueLift,
      totalInitRevenue,
      totalNewRevenue,
      conversionLiftPercentage: (overallRevenueLift / totalInitRevenue) * 100
    };
  };

  const { newInvestments, overallRevenueLift, conversionLiftPercentage } = calculateOptimizedState();

  return (
    <div className="space-y-10 font-sans">
      {/* Visual Header */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-2xl font-bold text-white font-display">A/B Significance Testing & Attribution Modeling</h2>
        <p className="text-gray-400 text-sm mt-1">
          Perform rigorous statistical validation on trial performance and model predictive budget optimization configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* A/B Testing Card */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
            <Percent className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-display">A/B Conversion Ratio Hypothesis Test</h3>
          </div>

          <div className="space-y-4">
            {/* Variation A Inputs */}
            <div className="space-y-3 p-4 bg-[#1A1A1A] border border-white/5 rounded-lg">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Landing Page A (Control copy)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">VisitorsCount</label>
                  <input
                    type="number"
                    value={visitorsA}
                    onChange={(e) => setVisitorsA(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#202020] border border-white/10 rounded-md px-3 py-1 text-sm text-white"
                    id="ab-visitors-a"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Signups/Conversions</label>
                  <input
                    type="number"
                    value={conversionsA}
                    onChange={(e) => setConversionsA(Math.min(visitorsA, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-[#202020] border border-white/10 rounded-md px-3 py-1 text-sm text-white"
                    id="ab-conversions-a"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Conversion Rate:&nbsp;
                <span className="font-semibold text-cyan-400 font-mono">{(rateA * 100).toFixed(2)}%</span>
              </div>
            </div>

            {/* Variation B Inputs */}
            <div className="space-y-3 p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-lg">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Landing Page B (Benefit Copy)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">VisitorsCount</label>
                  <input
                    type="number"
                    value={visitorsB}
                    onChange={(e) => setVisitorsB(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#202020] border border-white/10 rounded-md px-3 py-1 text-sm text-white"
                    id="ab-visitors-b"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1">Signups/Conversions</label>
                  <input
                    type="number"
                    value={conversionsB}
                    onChange={(e) => setConversionsB(Math.min(visitorsB, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-[#202020] border border-white/10 rounded-md px-3 py-1 text-sm text-white"
                    id="ab-conversions-b"
                  />
                </div>
              </div>
              <div className="text-xs text-cyan-400">
                Conversion Rate:&nbsp;
                <span className="font-semibold text-cyan-300 font-mono">{(rateB * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Statistical Verification Result */}
          <div className={`p-4 rounded-xl border ${isSignificant ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
            <div className="flex items-start space-x-3">
              {isSignificant ? (
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className={`block font-bold text-sm ${isSignificant ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isSignificant ? '🎉 Statistically Significant Difference!' : '⚠️ Differences are Not Statistically Significant'}
                </span>
                <span className={`block text-xs leading-normal ${isSignificant ? 'text-gray-300' : 'text-gray-350'}`}>
                  Variation B achieved a relative metrics lift of <strong className="font-mono text-cyan-300">{rawLift.toFixed(2)}%</strong> compared to control.
                  The statistical Z-Score is <strong className="font-mono text-cyan-300">{zScore.toFixed(3)}</strong> yielding a P-Value of <strong className="font-mono text-cyan-350">{pValue.toFixed(6)}</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Allocation Optimizer Card */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-6">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-display">Campaign Budget Optimization Model</h3>
          </div>

          <p className="text-xs text-gray-400 leading-normal">
            YouTube Video ads are underperforming with negative ROI (-12%). Use the optimizer slider below to divert ad spend from underperforming formats directly into high-performing channels (LinkedIn, Google Search, and Email Newsletter).
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-gray-300">Re-allocation Level</span>
              <span className="font-bold text-cyan-400 font-mono">{optimizationLevel}% of Underperforming Budget</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={optimizationLevel}
              onChange={(e) => setOptimizationLevel(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
              id="slider-budget-optim"
            />
          </div>

          {/* Allocation Breakdown Comparison Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Optimized Channels Cost Allocation ($)</h4>
            <div className="divide-y divide-white/5 border border-white/5 rounded-lg overflow-hidden bg-[#1A1A1A]/45 text-xs">
              {newInvestments.map((item) => {
                const original = initBudgets.find(b => b.name === item.name)!;
                const costChange = item.cost - original.currentCost;
                return (
                  <div key={item.name} className="p-3 flex justify-between items-center">
                    <div>
                      <span className="block font-medium text-white">{item.name}</span>
                      <span className="block text-[10px] text-gray-500">ROI: {(item.newRoi*100).toFixed(0)}%</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="block text-gray-250 font-semibold">${Math.round(item.cost).toLocaleString()}</span>
                      {costChange !== 0 && (
                        <span className={`block text-[9px] font-bold ${costChange > 0 ? 'text-emerald-400' : 'text-[#f87171]'}`}>
                          {costChange > 0 ? `+$${Math.round(costChange).toLocaleString()}` : `-$${Math.round(Math.abs(costChange)).toLocaleString()}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Lift Estimate */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500 rounded-lg text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <ArrowUpRight className="w-5 h-5 font-bold" />
              </div>
              <div>
                <span className="block text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Predicted Revenue Lift</span>
                <span className="block text-xl font-bold text-white mt-0.5">
                  +${Math.round(overallRevenueLift).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 font-mono py-1 px-2 pb-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                +{conversionLiftPercentage.toFixed(2)}% Lift
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
