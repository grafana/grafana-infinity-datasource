import { uniq, flatten } from 'lodash';
import { filterResults } from './filter';
import {
  InfinityQuery,
  ScrapColumn,
  GrafanaTableRow,
  timeSeriesResult,
  ScrapColumnFormat,
  InfinityQueryFormat,
  InfinityQueryType,
} from './../../types';
import { toDataFrame } from '@grafana/data';

export class InfinityParser {
  target: InfinityQuery;
  rows: GrafanaTableRow[];
  series: timeSeriesResult[];
  AutoColumns: ScrapColumn[];
  StringColumns: ScrapColumn[];
  NumbersColumns: ScrapColumn[];
  TimeColumns: ScrapColumn[];
  constructor(target: InfinityQuery) {
    this.rows = [];
    this.series = [];
    this.target = target;
    this.AutoColumns = target.columns || [];
    this.StringColumns = target.columns.filter((t) => t.type === ScrapColumnFormat.String);
    this.NumbersColumns = target.columns.filter((t) => t.type === ScrapColumnFormat.Number);
    this.TimeColumns = target.columns.filter(
      (t) =>
        t.type === ScrapColumnFormat.Timestamp ||
        t.type === ScrapColumnFormat.Timestamp_Epoch ||
        t.type === ScrapColumnFormat.Timestamp_Epoch_Seconds
    );
  }
  private canAutoGenerateColumns(): boolean {
    return (
      [InfinityQueryType.CSV, InfinityQueryType.JSON, InfinityQueryType.GraphQL].includes(this.target.type) &&
      this.target.columns.length === 0
    );
  }
  toTable() {
    let columns = this.target.columns;
    if (this.canAutoGenerateColumns()) {
      columns = this.AutoColumns;
    }
    return {
      name: this.target.refId,
      rows: this.rows.filter((row) => row.length > 0),
      columns,
    };
  }
  toTimeSeries() {
    const targets = uniq(this.series.map((s) => s.target));
    return targets.map((t) => {
      return {
        target: t,
        name: this.target.refId,
        datapoints: flatten(this.series.filter((s) => s.target === t).map((s) => s.datapoints)),
      };
    });
  }
  getResults() {
    if (
      this.target.filters &&
      this.target.filters.length > 0 &&
      this.target.columns &&
      this.target.columns.length > 0
    ) {
      this.rows = filterResults(this.rows, this.target.columns, this.target.filters);
    }
    if (this.target.format === InfinityQueryFormat.TimeSeries) {
      return this.toTimeSeries();
    } else if (this.target.format === InfinityQueryFormat.DataFrame) {
      const frame = toDataFrame(this.toTable());
      frame.name = this.target.refId;
      return frame;
    } else {
      return this.toTable();
    }
  }
}
