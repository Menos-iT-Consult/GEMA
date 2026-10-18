export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Western North",
  "Central",
  "Eastern",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo"
] as const;

export type GhanaRegion = (typeof GHANA_REGIONS)[number];

export const DENOMINATIONS = [
  "Baptist",
  "Pentecostal",
  "Charismatic",
  "Reformed",
  "Anglican",
  "Methodist",
  "Presbyterian",
  "Non-Denominational",
  "Independent",
  "Apostolic",
  "Other"
] as const;

export const UMBRELLA_BODIES = ["GPCC", "GEA", "NACCC", "Independent"] as const;

export const MINISTRY_FOCUS_OPTIONS = [
  "Missions",
  "Youth",
  "Education",
  "Church Planting",
  "Relief",
  "Media",
  "Healthcare",
  "Women",
  "Children",
  "Evangelism"
] as const;

export const ORG_STATUSES = [
  "PENDING_REVIEW",
  "UNDER_VETTING",
  "APPROVED",
  "SUSPENDED",
  "RENEWAL_DUE"
] as const;

export type OrgStatus = (typeof ORG_STATUSES)[number];
