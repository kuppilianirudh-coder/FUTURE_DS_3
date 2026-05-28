/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketingLead {
  leadId: string;
  channel: string;
  campaign: string;
  impressions: number;
  clicks: number;
  visits: number;
  signups: number;
  purchases: number;
  cost: number;
  revenue: number;
  device: string;
  region: string;
  date: string;
  // Metadata for original pipeline issues
  isDuplicate?: boolean;
  hasMissingFields?: boolean;
  isOutlier?: boolean;
}

export interface FunnelState {
  impressions: number;
  clicks: number;
  visits: number;
  signups: number;
  purchases: number;
}

export interface FilterState {
  channel: string;
  campaign: string;
  device: string;
  region: string;
  startDate: string;
  endDate: string;
}

export interface AbTestGroup {
  name: string;
  visitors: number;
  signups: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
}
