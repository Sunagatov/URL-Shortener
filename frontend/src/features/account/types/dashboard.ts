export type DashboardStat = {
  changeLabel: string;
  label: string;
  value: string;
};

export type DashboardActivityItem = {
  id: string;
  primary: string;
  secondary: string;
};

export type DashboardRecentUrlItem = {
  clickCount: number;
  createdAtLabel: string;
  domain: string;
  shortSlug: string;
  urlHash: string;
};
