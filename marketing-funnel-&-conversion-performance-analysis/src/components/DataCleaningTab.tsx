/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, CheckCircle, AlertTriangle, RefreshCw, Terminal, Info } from 'lucide-react';
import { CleaningLog, runDataCleaningPipeline } from '../data';
import { MarketingLead } from '../types';

interface DataCleaningTabProps {
  rawData: MarketingLead[];
  cleanedData: MarketingLead[];
  onDataCleaned: (cleaned: MarketingLead[], log: CleaningLog) => void;
  activeLog: CleaningLog | null;
}

export default function DataCleaningTab({
  rawData,
  cleanedData,
  onDataCleaned,
  activeLog
}: DataCleaningTabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Calculate some characteristics of raw data
  const rawDuplicatesCount = rawData.filter(x => x.isDuplicate).length;
  const rawMissingDeviceCount = rawData.filter(x => !x.device || x.device.trim() === '').length;
  const rawOutliersCount = rawData.filter(x => x.isOutlier).length;

  const handleRunPipeline = () => {
    setIsRunning(true);
    setLogs([]);
    
    const loggingSteps = [
      "💾 Initializing pandas core... loading 'marketing_dataset_raw.csv'",
      "[ ETL ] Dimensions: " + rawData.length + " rows x 13 columns found.",
      "🔍 Step 1/4: Looking for duplicates based on Campaign, Region, Device, and Date...",
      `⚡ Duplicate search complete: Found ${rawDuplicatesCount} duplicate rows. Applying df.drop_duplicates()`,
      "🔍 Step 2/4: Checking for missing values...",
      `⚡ Missing elements: Found ${rawMissingDeviceCount} records with NaN 'Device Type'. Imputing with mode value ('Desktop')`,
      "🔍 Step 3/4: Inspecting numerical features for outliers...",
      `⚡ Outliers identified: Found ${rawOutliersCount} heavy cost/revenue variance anomalies (values 10x median). Applying Winsorization capping...`,
      "🔍 Step 4/4: Validating date format strings...",
      "⚡ Reformatting mismatched 'Date' records to unified YYYY-MM-DD Iso standard.",
      "💾 Generating results... Exporting to 'marketing_dataset_clean.csv'",
      "🎉 Pandas ETL pipeline ran successfully with 0 execution faults! Dashboard metrics synchronized."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loggingSteps.length) {
        setLogs(prev => [...prev, loggingSteps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        // Run cleaning
        const result = runDataCleaningPipeline(rawData);
        onDataCleaned(result.cleanedData, result.log);
        setIsRunning(false);
      }
    }, 450);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Data Cleansing & ETL Pipeline Simulator</h2>
          <p className="text-gray-400 text-sm mt-1">
            Analyze, detect and resolve tracking defects, extreme metrics, or duplicate uploads matching our Python pipeline.
          </p>
        </div>
        <button
          onClick={handleRunPipeline}
          disabled={isRunning}
          id="btn-run-cleaning"
          className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-150 shrink-0 border cursor-pointer ${
            isRunning
              ? 'bg-[#1A1A1A] text-gray-500 border-white/5 cursor-not-allowed'
              : 'bg-white/10 text-white border-white/10 hover:bg-white/15 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]'
          }`}
        >
          {isRunning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current text-white/90" />
          )}
          <span>{isRunning ? 'Processing Code Pipeline...' : 'Run ETL Preprocessing'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Compare Card */}
        <div className="lg:col-span-1 bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-bold text-white font-display flex items-center space-x-2">
            <span>Tracking Quality Diagnostics</span>
          </h3>

          <div className="space-y-3.5">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-semibold text-red-300 text-sm">Duplicate Admissions</span>
                <span className="block text-xs text-red-400/80 mt-0.5">
                  {rawDuplicatesCount} redundant logs generated from tracking telemetry lag.
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start space-x-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-semibold text-amber-300 text-sm">Missing Dimension Fields</span>
                <span className="block text-xs text-amber-400/80 mt-0.5">
                  {rawMissingDeviceCount} leads with null or empty device attributes.
                </span>
              </div>
            </div>

            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-semibold text-cyan-300 text-sm">Skewing Metrics Outliers</span>
                <span className="block text-xs text-cyan-400/80 mt-0.5">
                  {rawOutliersCount} campaign spikes skewing true costs/revenues.
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Database Dimensions</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <span className="block text-xs text-gray-400">Raw Leads Count</span>
                <span className="block text-lg font-bold text-gray-200 mt-0.5">{rawData.length}</span>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <span className="block text-xs text-cyan-400">Cleaned Leads Count</span>
                <span className="block text-lg font-bold text-cyan-200 mt-0.5">{cleanedData.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Terminal Output console style */}
        <div className="lg:col-span-2 bg-[#0F0F0F] rounded-xl p-5 border border-white/5 flex flex-col h-[320px] lg:h-auto overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 shrink-0">
            <div className="flex items-center space-x-2 text-gray-400 font-mono text-xs">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Pandas Compiler Terminal</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs text-gray-300 leading-normal scrollbar-none pr-2">
            {logs.length === 0 ? (
              <div className="text-gray-600 italic flex items-center justify-center h-full">
                Click "Run ETL Preprocessing" to execute the Data Science preprocessing script...
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-1.5 rounded transition bg-[#1A1A1A]/40 border border-transparent ${
                    log.includes('🎉') || log.includes('complete')
                      ? 'text-emerald-400 border-emerald-950/40 bg-emerald-950/10'
                      : log.includes('⚡')
                      ? 'text-cyan-400 border-cyan-950/40 bg-cyan-950/10'
                      : 'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {activeLog && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start space-x-4">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-2 w-full">
            <h3 className="text-lg font-bold text-emerald-400 font-display">Processing Pipeline Executed Successfully</h3>
            <p className="text-emerald-300/90 text-sm">
              The dashboard data has been updated with the clean, validated dataset. The following changes were made:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-[#1A1A1A] border border-white/5 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-400">Duplicates Removed</span>
                <span className="block text-xl font-bold text-emerald-450 mt-0.5">{activeLog.duplicatesRemoved}</span>
              </div>
              <div className="bg-[#1A1A1A] border border-white/5 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-400">Missing Imputed</span>
                <span className="block text-xl font-bold text-emerald-450 mt-0.5">{activeLog.missingValuesFixed}</span>
              </div>
              <div className="bg-[#1A1A1A] border border-white/5 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-400">Outliers Capped</span>
                <span className="block text-xl font-bold text-emerald-450 mt-0.5">{activeLog.outliersCapped}</span>
              </div>
              <div className="bg-[#1A1A1A] border border-white/5 p-3 rounded-lg text-center">
                <span className="block text-xs text-gray-400">Dates Standardized</span>
                <span className="block text-xl font-bold text-emerald-450 mt-0.5">{activeLog.datesStandardized}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
