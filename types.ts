
export interface ServiceInfo {
  desc: string;
  details: string[];
}

export type ServicesDB = Record<string, ServiceInfo>;

export enum ProjectStatus {
  QUOTING = 'QUOTING',
  PROPOSED = 'PROPOSED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export interface SiteAddress {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

export interface BidItem {
  serviceName: string;
  selected: boolean;
  estCost: number;
  details: Record<string, any>;
  notes: string;
  aiRecommendations: string;
}

export interface ProjectState {
  id: string;
  bids: Record<string, BidItem>;
  clientName: string;
  projectDate: string;
  status: ProjectStatus;
  siteAddress: SiteAddress;
  phoneNumber: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  SUMMARY = 'SUMMARY',
  DETAILED = 'DETAILED',
  SPECS = 'SPECS'
}

export interface User {
  name: string;
  email: string;
  picture?: string;
}
