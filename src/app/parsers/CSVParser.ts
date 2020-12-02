import { forEach, get, toNumber } from 'lodash';
import parse from 'csv-parse/lib/sync';
import { InfinityParser } from './InfinityParser';
import { InfinityQuery, ScrapColumn, GrafanaTableRow } from './../../types';

export class CSVParser extends InfinityParser {
  constructor(CSVResponse: string, target: InfinityQuery, endTime?: Date) {
    super(target);
    const records = this.formatInput(CSVResponse);
    if (Array.isArray(records)) {
      this.constructTableData(records);
      this.constructTimeSeriesData(records, endTime);
    }
  }
  private formatInput(CSVResponse: string) {
    const options = {
      columns: true,
      skip_empty_lines: true,
    };
    const records = parse(CSVResponse, options);
    return records;
  }
  private constructTableData(records: any[]) {
    forEach(records, r => {
      const row: GrafanaTableRow = [];
      this.target.columns.forEach((c: ScrapColumn) => {
        let value = get(r, c.selector, '');
        if (c.type === 'timestamp') {
          value = new Date(value);
        } else if (c.type === 'timestamp_epoch') {
          value = new Date(parseInt(value, 10));
        } else if (c.type === 'timestamp_epoch_s') {
          value = new Date(parseInt(value, 10) * 1000);
        } else if (c.type === 'number') {
          value = value === '' ? null : +value;
        }
        row.push(value);
      });
      this.rows.push(row);
    });
  }
  private constructTimeSeriesData(records: any[], endTime: Date | undefined) {
    this.NumbersColumns.forEach((metricColumn: ScrapColumn) => {
      forEach(records, r => {
        let seriesName = this.StringColumns.map(c => r[c.selector]).join(' ');
        if (this.NumbersColumns.length > 1) {
          seriesName += ` ${metricColumn.text}`;
        }
        if (this.NumbersColumns.length === 1 && seriesName === '') {
          seriesName = `${metricColumn.text}`;
        }
        seriesName = seriesName.trim();
        let timestamp = endTime ? endTime.getTime() : new Date().getTime();
        if (this.TimeColumns.length >= 1) {
          const FirstTimeColumn = this.TimeColumns[0];
          if (FirstTimeColumn.type === 'timestamp') {
            timestamp = new Date(get(r, FirstTimeColumn.selector)).getTime();
          } else if (FirstTimeColumn.type === 'timestamp_epoch') {
            timestamp = new Date(parseInt(get(r, FirstTimeColumn.selector), 10)).getTime();
          } else if (FirstTimeColumn.type === 'timestamp_epoch_s') {
            timestamp = new Date(parseInt(get(r, FirstTimeColumn.selector), 10) * 1000).getTime();
          }
        }
        let metric = get(r, metricColumn.selector);
        if (metric === '') {
          metric = null;
        } else {
          metric = toNumber(metric);
        }
        this.series.push({
          target: seriesName,
          datapoints: [[metric, timestamp]],
        });
      });
    });
  }
}
