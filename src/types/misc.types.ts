//#region Grafana Types
export interface MetricFindValue {
  text: string;
  value: string | number;
  label?: string;
}

export type dataPoint = [number | null, number];
export type timeSeriesResult = {
  target: string;
  datapoints: dataPoint[];
};
export type GrafanaTableColumn = {
  text: string;
  type: string;
};
export type GrafanaTableRowItem = string | boolean | number | object | null;
export type GrafanaTableRow = GrafanaTableRowItem[];
export type tableResult = {
  columns: GrafanaTableColumn[];
  rows: GrafanaTableRow;
};
export type HealthCheckResult = {
  message: string;
  status: 'success' | 'error';
};

export type queryResult = timeSeriesResult | tableResult;
export type EditorMode = 'standard' | 'global' | 'variable';
//#endregion
