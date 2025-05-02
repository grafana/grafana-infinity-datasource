import parse from 'csv-parse/lib/sync';
import { forEach, get } from 'lodash';
import { InfinityParser } from '@/app/parsers/InfinityParser';
import { getColumnsFromObjectArray, getValue } from '@/app/parsers/utils';
import type { GrafanaTableRow, InfinityColumn, InfinityCSVQuery, InfinityTSVQuery } from '@/types';

export class CSVParser extends InfinityParser<InfinityCSVQuery | InfinityTSVQuery> {
  constructor(CSVResponse: string, target: InfinityCSVQuery | InfinityTSVQuery, endTime?: Date) {
    super(target);
    const records = this.formatInput(CSVResponse);
    if (Array.isArray(records)) {
      this.constructTableData(records);
      this.constructTimeSeriesData(records, endTime);
    }
  }
  private getDelimiter(target: InfinityCSVQuery | InfinityTSVQuery) {
    if (target.type === 'tsv') {
      return `\t`;
    }
    if (target.parser === 'uql') {
      return '';
    }
    if (target.csv_options && target.csv_options.delimiter) {
      return (target.csv_options.delimiter || '').replace('\\t', '\t');
    }
    return ',';
  }
  private formatInput(CSVResponse: string) {
    if (this.target.parser === 'uql') {
      return '';
    }
    const options = {
      columns: this.target.csv_options && this.target.csv_options.columns ? this.target.csv_options.columns.split(',') : true,
      delimiter: [this.getDelimiter(this.target)],
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
        row.push(getValue(value, c.type));
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
          timestamp = getValue(get(r, FirstTimeColumn.selector), FirstTimeColumn.type, true) as number;
        }
        let metric = get(r, metricColumn.selector, true);
        metric = getValue(metric, 'number');
        this.series.push({
          target: seriesName,
          datapoints: [[metric, timestamp]],
        });
      });
    });
  }
}
