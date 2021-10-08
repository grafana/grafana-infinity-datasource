import { forEach, get, toNumber } from 'lodash';
import parse from 'csv-parse/lib/sync';
import { InfinityParser } from './InfinityParser';
import { getColumnsFromObjectArray } from './utils';
import { InfinityQuery, InfinityColumn, GrafanaTableRow } from './../../types';

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
      columns: this.target.csv_options && this.target.csv_options.columns ? this.target.csv_options.columns.split(',') : true,
      delimiter: this.target.csv_options && this.target.csv_options.delimiter ? [this.target.csv_options.delimiter.replace('\\t', '\t')] : [','],
      skip_empty_lines: this.target.csv_options?.skip_empty_lines || false,
      skip_lines_with_error: this.target.csv_options?.skip_lines_with_error || false,
      relax_column_count: this.target.csv_options?.relax_column_count || false,
      comment: '',
    };
    if (this.target.csv_options && this.target.csv_options.comment) {
      options.comment = this.target.csv_options.comment;
    }
    const records = parse(CSVResponse.trim(), options);
    return records;
  }
  private constructTableData(records: any[]) {
    const columns = this.target.columns.length > 0 ? this.target.columns : getColumnsFromObjectArray(records[0]);
    this.AutoColumns = columns;
    forEach(records, (r) => {
      const row: GrafanaTableRow = [];
      columns.forEach((c: InfinityColumn) => {
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
    this.NumbersColumns.forEach((metricColumn: InfinityColumn) => {
      forEach(records, (r) => {
        let seriesName = this.StringColumns.map((c) => r[c.selector]).join(' ');
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
