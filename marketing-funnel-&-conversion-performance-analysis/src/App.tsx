/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart4, Terminal, RefreshCw, FileCode, CheckCircle, Info, FileText 
} from 'lucide-react';

import { generateRawMarketingData, runDataCleaningPipeline, CleaningLog } from './data';
import { MarketingLead } from './types';

// Importing Custom Views
import DashboardTab from './components/DashboardTab';
import DataCleaningTab from './components/DataCleaningTab';
import AdvancedAnalysisTab from './components/AdvancedAnalysisTab';
import ReportTab from './components/ReportTab';
import RepositoryExplorer from './components/RepositoryExplorer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // High fidelity synthetic data state
  const rawData = useMemo(() => generateRawMarketingData(), []);
  
  // Active dataset that feeds charts & analytics
  const [activeData, setActiveData] = useState<MarketingLead[]>(rawData);
  const [cleaningLog, setCleaningLog] = useState<CleaningLog | null>(null);
  const [isDataClean, setIsDataClean] = useState<boolean>(false);

  // Callback when user runs the Pandas ETL simulation
  const handleDataCleaned = (cleaned: MarketingLead[], log: CleaningLog) => {
    setActiveData(cleaned);
    setCleaningLog(log);
    setIsDataClean(true);
    // Auto redirect to active dashboard tab once completed to see result
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 font-sans antialiased flex flex-col justify-between print:bg-white print:text-black">
      
      {/* 1. APP TOP BAR HEADER */}
      <header className="bg-[#111111] text-white print:hidden py-4 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <span className="text-black font-bold text-xs italic">F03</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-black text-lg tracking-tight">FUTURE_DS_03</span>
                <span className="h-4 w-px bg-white/10 block mx-1"></span>
                <span className="text-cyan-400 font-mono text-xs font-semibold py-0.5 px-1.5 bg-cyan-950/20 rounded border border-cyan-500/20">Data Science Sandbox</span>
              </div>
              <span className="text-[11px] text-gray-500 block tracking-wide">Marketing Funnel & Conversion Performance Analysis</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 shrink-0 text-xs font-mono">
            {/* Live Data cleaning status capsule */}
            <div className={`py-1 px-3 rounded-full flex items-center space-x-1.5 border ${
              isDataClean 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full block ${isDataClean ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{isDataClean ? 'Clean Pandas ETL Matrix Live' : 'Raw Trace Telemetry (Uncleaned)'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. SUB HEADER / TAB CONTROLLER BAR */}
      <section className="bg-[#111111] border-b border-white/5 py-4 px-6 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', label: '📊 Campaign Dashboard', title: 'Interactive Analytics' },
              { id: 'cleaning', label: '🧹 Pipeline ETL', title: 'Data Preprocessor' },
              { id: 'advanced', label: '🧪 Advanced Statistics', title: 'A/B Tests & Rules' },
              { id: 'report', label: '📄 Printable Report', title: 'Executive study PDF' },
              { id: 'code', label: '💻 Python Code Repo', title: 'Physical files explore' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-150 text-left cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10'
                }`}
                id={`tab-select-${tab.id}`}
              >
                <div>{tab.label}</div>
              </button>
            ))}
          </div>
          
          <div className="text-right text-[11px] text-gray-500 font-mono">
            Trace Seed: 42 • Local Target UTC Time: 2026-05-28
          </div>
        </div>
      </section>

      {/* 3. MAIN TABBED CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:max-w-none">
        
        {/* TAB 1: VISUAL ANALYTICS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {!isDataClean && (
              <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-4">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-gray-300 leading-normal">
                  <strong>Notice:</strong> Currently displaying <strong>raw</strong> dataset analytics containing telemetry duplicates, missing values, and outliers.&nbsp;
                  Go to the <button onClick={() => setActiveTab('cleaning')} className="text-cyan-400 underline font-semibold hover:text-cyan-300 cursor-pointer">Pipeline ETL</button> tab 
                  to run the clean dataset preprocessor and smooth chart fluctuations!
                </div>
              </div>
            )}
            <DashboardTab data={activeData} />
          </div>
        )}

        {/* TAB 2: DATA CLEANING COMPILER */}
        {activeTab === 'cleaning' && (
          <DataCleaningTab 
            rawData={rawData} 
            cleanedData={activeData} 
            onDataCleaned={handleDataCleaned}
            activeLog={cleaningLog}
          />
        )}

        {/* TAB 3: HYPOTHESIS TESTING AND CONVERSION MATH */}
        {activeTab === 'advanced' && (
          <AdvancedAnalysisTab />
        )}

        {/* TAB 4: executive BUSINESS REPORT AND PDF PRINT FORMAT */}
        {activeTab === 'report' && (
          <ReportTab cleanedData={activeData} />
        )}

        {/* TAB 5: FILE TREE AND PYTHON SOURCE CODE */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white font-display">Python Code Repository & Jupyter Notebook</h2>
              <p className="text-gray-400 text-sm">
                Explore, inspect, and copy physical pipeline python source files generated inside our root workspace workspace tree.
              </p>
            </div>
            <RepositoryExplorer />
          </div>
        )}

      </main>

      {/* 4. MODERN FOOTER FRAMEWORK */}
      <footer className="bg-[#0C0C0C] border-t border-white/5 py-6 px-6 text-center text-gray-500 text-xs font-mono print:hidden mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span>FUTURE_DS_03 Marketing Conversion Analyzer Suite • Made under Google AI Studio Built</span>
          <div className="flex items-center space-x-4">
            <span className="hover:text-gray-300 transition">Python 3.11</span>
            <span>•</span>
            <span className="hover:text-gray-300 transition">Pandas Preprocessor</span>
            <span>•</span>
            <span className="hover:text-gray-300 transition">Streamlit 1.28</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
