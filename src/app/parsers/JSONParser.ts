import { forEach, get, toNumber } from 'lodash';
import { InfinityParser } from './InfinityParser';
import { InfinityQuery, ScrapColumn, GrafanaTableRow } from './../../types';

export class JSONParser extends InfinityParser {
  constructor(JSONResponse: object, target: InfinityQuery, endTime?: Date) {
    super(target);
    const jsonResponse = this.formatInput(JSONResponse);
    if (Array.isArray(jsonResponse)) {
      this.constructTableData(jsonResponse);
      this.constructTimeSeriesData(jsonResponse, endTime);
    } else {
      this.constructSingleTableData(jsonResponse);
    }
  }
  private formatInput(JSONResponse: object) {
    if (typeof JSONResponse === 'string') {
      JSONResponse = JSON.parse(JSONResponse);
    }
    if (this.target.root_selector) {
      JSONResponse = get(JSONResponse, this.target.root_selector);
    }
    return JSONResponse;
  }
  private constructTableData(JSONResponse: any[]) {
    forEach(JSONResponse, r => {
      const row: GrafanaTableRow = [];
      this.target.columns.forEach((c: ScrapColumn) => {
        let value = get(r, c.selector, '');
        if (c.type === 'timestamp') {
          value = new Date(value + "");
        } else if (c.type === 'timestamp_epoch') {
          value = new Date(parseInt(value));
        } else if (c.type === 'number') {
          value = value === '' ? null : +value;
        }
        row.push(value);
      });
      this.rows.push(row);
    });
  }
  private constructTimeSeriesData(JSONResponse: object, endTime: Date | undefined) {
    this.NumbersColumns.forEach((metricColumn: ScrapColumn) => {
      forEach(JSONResponse, r => {
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
            timestamp = new Date(get(r, FirstTimeColumn.selector) + "").getTime();
          } else if (FirstTimeColumn.type === 'timestamp_epoch') {
            timestamp = new Date(parseInt(get(r, FirstTimeColumn.selector))).getTime();
          } 
        }
        let metric = toNumber(get(r, metricColumn.selector));
        this.series.push({
          target: seriesName,
          datapoints: [[metric, timestamp]],
        });
      });
    });
  }
  private constructSingleTableData(JSONResponse: object) {
    const row: GrafanaTableRow = [];
    this.target.columns.forEach((c: ScrapColumn) => {
      row.push(get(JSONResponse, c.selector, ''));
    });
    this.rows.push(row);
  }
}
