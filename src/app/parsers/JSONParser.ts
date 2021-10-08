import { forEach, get, toNumber, flatten } from 'lodash';
import { JSONPath } from 'jsonpath-plus';
import { InfinityParser } from './InfinityParser';
import { InfinityColumn, GrafanaTableRow, InfinityJSONQuery, InfinityGraphQLQuery } from './../../types';
import { getColumnsFromObjectArray, columnarToTable } from './utils';

export class JSONParser extends InfinityParser<InfinityJSONQuery | InfinityGraphQLQuery> {
  constructor(JSONResponse: object, target: InfinityJSONQuery | InfinityGraphQLQuery, endTime?: Date) {
    super(target);
    let jsonResponse = this.formatInput(JSONResponse);
    if (this.target.json_options?.columnar) {
      jsonResponse = columnarToTable(jsonResponse, this.target.columns);
    }
    if (Array.isArray(jsonResponse) && (typeof jsonResponse[0] === 'string' || typeof jsonResponse[0] === 'number')) {
      jsonResponse = jsonResponse.map((value) => {
        return { value };
      });
    } else if (!(Array.isArray(jsonResponse) || (this.target.json_options && this.target.json_options.root_is_not_array))) {
      jsonResponse = this.findArrayData(jsonResponse);
    }
    if (Array.isArray(jsonResponse) || (target.json_options && target.json_options.root_is_not_array)) {
      this.constructTableData(jsonResponse as any[]);
      this.constructTimeSeriesData(jsonResponse, endTime);
    } else {
      this.constructSingleTableData(jsonResponse);
    }
  }
  private findArrayData(input: any): object {
    if (input) {
      const arrayItems: any[] = Object.keys(input)
        .filter((key: string) => {
          return Array.isArray(input[key]) && typeof input[key][0] !== 'string' && typeof input[key][0] !== 'number';
        })
        .map((key) => {
          return input[key];
        });
      if (arrayItems.length > 0) {
        return arrayItems[0];
      }
      return [input];
    } else {
      return input;
    }
  }
  private formatInput(JSONResponse: object) {
    if (typeof JSONResponse === 'string') {
      JSONResponse = JSON.parse(JSONResponse);
    }
    const rootSelect = this.target.root_selector;
    if (rootSelect) {
      if (rootSelect.startsWith('$')) {
        JSONResponse = flatten(
          JSONPath({
            path: rootSelect,
            json: JSONResponse,
          })
        );
      } else {
        JSONResponse = get(JSONResponse, rootSelect);
      }
    }
    return JSONResponse;
  }
  private constructTableData(JSONResponse: any[]) {
    const columns = this.target.columns.length > 0 ? this.target.columns : getColumnsFromObjectArray(JSONResponse[0]);
    this.AutoColumns = columns;
    forEach(JSONResponse, (r, rowKey) => {
      const row: GrafanaTableRow = [];
      columns.forEach((c: InfinityColumn) => {
        let value = get(r, c.selector, '');
        if (c.selector === '$$key') {
          value = rowKey;
        } else if (c.selector === '$$value') {
          value = JSON.stringify(r);
        }
        if (c.type === 'timestamp') {
          value = new Date(value + '');
        } else if (c.type === 'timestamp_epoch') {
          value = new Date(parseInt(value, 10));
        } else if (c.type === 'timestamp_epoch_s') {
          value = new Date(parseInt(value, 10) * 1000);
        } else if (c.type === 'number') {
          value = value === '' ? null : +value;
        }
        if (['string', 'number', 'boolean'].includes(typeof value)) {
          row.push(value);
        } else if (value && typeof value.getMonth === 'function') {
          row.push(value);
        } else {
          row.push(JSON.stringify(value));
        }
      });
      this.rows.push(row);
    });
  }
  private constructTimeSeriesData(JSONResponse: object, endTime: Date | undefined) {
    this.NumbersColumns.forEach((metricColumn: InfinityColumn) => {
      forEach(JSONResponse, (r) => {
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
            timestamp = new Date(get(r, FirstTimeColumn.selector) + '').getTime();
          } else if (FirstTimeColumn.type === 'timestamp_epoch') {
            timestamp = new Date(parseInt(get(r, FirstTimeColumn.selector), 10)).getTime();
          } else if (FirstTimeColumn.type === 'timestamp_epoch_s') {
            timestamp = new Date(parseInt(get(r, FirstTimeColumn.selector), 10) * 1000).getTime();
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
    this.target.columns.forEach((c: InfinityColumn) => {
      row.push(get(JSONResponse, c.selector, ''));
    });
    this.rows.push(row);
  }
}
