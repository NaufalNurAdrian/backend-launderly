
export type ReportTimeframe = "daily" | "weekly" | "monthly" | "yearly" | "custom";
export type ReportType = "transactions" | "revenue" | "customers" | "orders" | "comprehensive";

export interface ReportFilters {
  outletId?: number;
  startDate?: Date;
  endDate?: Date;
  timeframe?: ReportTimeframe;
  reportType?: ReportType;
}
