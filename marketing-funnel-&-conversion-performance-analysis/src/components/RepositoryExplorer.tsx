/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Folder, FileCode, FileText, Check, Copy, Download, Radio, BookOpen } from 'lucide-react';

interface FileItem {
  name: string;
  type: 'file' | 'notebook' | 'text';
  icon: React.ReactNode;
  content: string;
}

export default function RepositoryExplorer() {
  const [activeFile, setActiveFile] = useState<string>('README.md');
  const [copied, setCopied] = useState<boolean>(false);

  const files: Record<string, FileItem> = {
    'README.md': {
      name: 'README.md',
      type: 'text',
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      content: `# Marketing Funnel & Conversion Performance Analysis
**Project ID:** FUTURE_DS_03  
**Domain:** Marketing Analytics / Growth Data Science  

Welcome to the **Marketing Funnel & Conversion Performance Analysis** system. This repository covers the complete analytical lifecycle of an enterprise multi-channel promotion setup, focusing on conversion drop-offs, budget efficiency, A/B Testing, and region/device attribution.

---

## 📂 Project Structure

\`\`\`text
FUTURE_DS_03/
├── README.md               <-- Full project documentation and setup
├── requirements.txt         <-- Python environment dependencies
├── analytics.py             <-- Core ETL, Data Cleaning & Analytics Engine
├── dashboard.py             <-- Streamlit interactive dashboard logic
├── funnel_analysis.ipynb    <-- Jupyter Notebook exploratory study
└── reports/
    └── figures/             <-- Generated analytical visualizations
\`\`\`

---

## 📊 Dataset Schema

The system supports standard raw logs generated dynamically by ad platform integrations (Google Ads, Facebook Business, HubSpot).
- **Lead ID:** Unique trace identifier for the transaction track.
- **Marketing Channel:** Google Search, Facebook Ads, LinkedIn CRM, YouTube Video, Email Newsletter, Organic Search.
- **Campaign Name:** Dedicated promo identifiers (e.g., Spring Promo 2026).
- **Impressions / Clicks / Website Visits / Signups / Purchases:** Conversions across successive nested funnel stages.
- **Campaign Cost ($):** Absolute financial spend on the campaign.
- **Revenue Generated ($):** Financial income from user conversions.
- **Device Type / Region / Date:** Dimensional parameters.

---

## ⚙️ Direct Setup & Running Code

### 1. Installation
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 2. Run Processing Pipeline
Performs deduplication, imputes missing values, caps outliers, and exports cleaned CSV datasets:
\`\`\`bash
python analytics.py
\`\`\`

### 3. Launch the Interactive Dashboard
\`\`\`bash
streamlit run dashboard.py
\`\`\``
    },
    'requirements.txt': {
      name: 'requirements.txt',
      type: 'text',
      icon: <FileText className="w-4 h-4 text-amber-500" />,
      content: `pandas>=2.0.0
numpy>=1.24.0
matplotlib>=3.7.0
seaborn>=0.12.0
plotly>=5.15.0
streamlit>=1.28.0
scipy>=1.11.0
fpdf2>=2.7.5
jinja2>=3.1.2`
    },
    'analytics.py': {
      name: 'analytics.py',
      type: 'file',
      icon: <FileCode className="w-4 h-4 text-blue-500" />,
      content: `#!/usr/bin/env python3
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
    """Generates realistic raw marketing dataset with intentional anomalies for cleaning."""
    np.random.seed(random_seed)
    # ... code details ...`
    },
    'dashboard.py': {
      name: 'dashboard.py',
      type: 'file',
      icon: <FileCode className="w-4 h-4 text-sky-500" />,
      content: `import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from scipy import stats

st.set_page_config(page_title="Marketing Conversion & Funnel Analyzer", layout="wide", page_icon="📊")

@st.cache_data
def load_and_clean_data():
    # Reading generated cleaned file or building direct sample
    df = pd.read_csv('marketing_dataset_clean.csv')
    df['Date'] = pd.to_datetime(df['Date'])
    return df`
    },
    'funnel_analysis.ipynb': {
      name: 'funnel_analysis.ipynb',
      type: 'notebook',
      icon: <Radio className="w-4 h-4 text-orange-500" />,
      content: `### Jupyter Notebook Cell 1: Description
# FUTURE_DS_03: Marketing Funnel & Conversion Performance Analysis
This study details the systematic methodology backtesting conversion bottlenecks across our target channels.

### Jupyter Notebook Cell 2: Imports
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

### Jupyter Notebook Cell 3: Data Inspection & Processing
df_raw = pd.read_csv('../marketing_dataset_raw.csv')
print(f"Loaded {df_raw.shape[0]} raw records.")`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentFile = files[activeFile] || files['README.md'];

  return (
    <div className="bg-[#141414] text-gray-100 rounded-xl overflow-hidden border border-white/5 shadow-2xl h-[650px] flex flex-col font-sans">
      {/* Repo Top Bar */}
      <div className="bg-[#0B0B0B] px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/90 block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 block"></span>
          </div>
          <span className="h-4 w-px bg-white/10 block mx-1"></span>
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-mono">
            <span className="text-cyan-400 font-semibold text-xs py-0.5 px-2 bg-cyan-500/10 border border-cyan-500/20 rounded">GitHub Ready</span>
            <span>FUTURE_DS_03 /</span>
            <span className="text-white font-medium">{activeFile}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 font-medium text-xs transition duration-150 border border-white/5 cursor-pointer"
            title="Copy content to Clipboard"
            id={`btn-copy-${activeFile.replace('.', '-')}`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-300" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Tree Explorer */}
        <div className="w-64 bg-[#0B0B0B] border-r border-white/5 p-4 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-gray-500 text-xs font-semibold tracking-wider uppercase mb-3">
                <Folder className="w-3.5 h-3.5" />
                <span>workspace root</span>
              </div>
              <ul className="space-y-1">
                {Object.keys(files).map((fileName) => {
                  const file = files[fileName];
                  const isSelected = activeFile === fileName;
                  return (
                    <li key={fileName}>
                      <button
                        onClick={() => setActiveFile(fileName)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-sm transition duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 font-medium'
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                        }`}
                        id={`file-tree-btn-${fileName.replace('.', '-')}`}
                      >
                        {file.icon}
                        <span className="font-mono truncate">{fileName}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <div className="bg-[#141414] rounded-lg p-3 border border-white/5 space-y-2">
                <h4 className="text-xs font-semibold text-gray-400">Project Output Files:</h4>
                <div className="text-[11px] text-gray-500 font-mono space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 block"></span>
                    <span>marketing_dataset_raw.csv</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                    <span>marketing_dataset_clean.csv</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 font-mono border-t border-white/5 pt-3">
            Environment: Python 3.11.2<br />
            IPython / Pandas Pipeline
          </div>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 bg-[#101010] overflow-y-auto p-6 font-mono text-sm leading-relaxed">
          {currentFile.type === 'notebook' ? (
            <div className="space-y-4">
              <div className="text-gray-500 text-xs border-b border-white/5 pb-2 mb-4">
                📒 Jupyter Notebook Interactive Viewer
              </div>
              {currentFile.content.split('\n\n').map((cell, idx) => {
                const lines = cell.split('\n');
                const isMarkdown = lines[0].startsWith('### Jupyter Notebook Cell');
                const cellHeader = lines[0];
                const codeBody = lines.slice(1).join('\n');

                if (cellHeader.includes('Description')) {
                  return (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-lg p-4 font-sans text-gray-300">
                      <div className="text-[11px] text-orange-400 font-semibold mb-2 uppercase tracking-wider">Markdown Cell</div>
                      <h2 className="text-xl font-bold text-white font-display mb-2">FUTURE_DS_03: Funnel & Conversion Analytics</h2>
                      <p className="text-gray-400 text-sm">
                        This notebook covers pipeline validation, data loading, cohort drop-offs, budget ROIs, and significance t-testing.
                      </p>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="border border-white/5 rounded-lg overflow-hidden">
                    <div className="bg-[#0B0B0B] px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs text-gray-500">
                      <span>In [{idx}]:</span>
                      <span className="uppercase tracking-wider font-semibold text-[10px] text-cyan-400">Code Cell</span>
                    </div>
                    <pre className="p-4 bg-black/30 text-gray-350 overflow-x-auto text-xs leading-5">
                      <code>{codeBody || cell}</code>
                    </pre>
                  </div>
                );
              })}
            </div>
          ) : currentFile.name === 'README.md' ? (
            <div className="font-sans leading-relaxed text-gray-300 space-y-6 max-w-3xl">
              <h1 className="text-3xl font-bold text-white border-b border-white/5 pb-3 font-display">
                Marketing Funnel & Conversion Performance Analysis
              </h1>
              <div className="flex items-center space-x-3 text-xs text-gray-500 font-mono">
                <span>Repository: FUTURE_DS_03</span>
                <span>•</span>
                <span>Type: Data Science Solution</span>
              </div>
              <p className="text-gray-400">
                A professional, scalable pipeline setup to aggregate multi-channel marketing campaigns, execute robust preprocessing pipelines using Pandas, resolve metrics bottlenecks, and visualize outcomes.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-200 pt-2 font-display">📂 Project Architecture</h3>
              <pre className="bg-[#0B0B0B] border border-white/5 p-4 rounded-lg font-mono text-xs text-gray-400">
{`FUTURE_DS_03/
├── README.md               <-- Documentation
├── requirements.txt         <-- Python packages
├── analytics.py             <-- Cleansing & Stats engine
├── dashboard.py             <-- Streamlit app script
└── funnel_analysis.ipynb    <-- Jupyter study notebook`}
              </pre>

              <h3 className="text-xl font-semibold text-gray-200 pt-2 font-display">🚀 Fast Execution Overview</h3>
              <p className="text-sm text-gray-400">Configure environments and run the preprocessing scripts directly via command line interface:</p>
              <div className="bg-[#0B0B0B] border border-white/5 p-4 rounded-lg font-mono text-xs text-cyan-400 space-y-1">
                <div># Install dependencies</div>
                <div className="text-gray-200">pip install -r requirements.txt</div>
                <div className="pt-2"># Run the ETL & validation pipeline</div>
                <div className="text-gray-200">python analytics.py</div>
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre overflow-x-auto text-xs leading-5 text-gray-300">
              <code>{currentFile.content}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
