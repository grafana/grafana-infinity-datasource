import { JSONPath } from 'jsonpath-plus';
import { flatten, forEach, get } from 'lodash';
import { InfinityParser } from './InfinityParser';
import { columnarToTable, getColumnsFromObjectArray, getValue } from './utils';
import type { GrafanaTableRow, InfinityColumn, InfinityGraphQLQuery, InfinityJSONQuery } from './../../types';

export class JSONParser extends InfinityParser<InfinityJSONQuery | InfinityGraphQLQuery> {
  constructor(JSONResponse: object, target: InfinityJSONQuery | InfinityGraphQLQuery, endTime?: Date) {
    super(target);
    let jsonResponse = this.formatInput(JSONResponse);
    if (this.target.parser === 'backend' || this.target.parser === 'uql' || this.target.parser === 'groq') {
      return;
    }
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
    if (Array.isArray(jsonResponse) || (this.target.json_options && this.target.json_options.root_is_not_array)) {
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
            eval: false,
          })
        );
      } else {
        JSONResponse = get(JSONResponse, rootSelect);
      }
    }
    return JSONResponse;
  }
  private constructTableData(JSONResponse: any[]) {
    const columns = this.target?.columns?.length > 0 ? this.target.columns : getColumnsFromObjectArray(JSONResponse[0]);
    this.AutoColumns = columns || [];
    forEach(JSONResponse, (r, rowKey) => {
      const row: GrafanaTableRow = [];
      columns.forEach((c: InfinityColumn) => {
        let value = get(r, c.selector, '');
        if (c.selector === '$$key') {
          value = rowKey;
        } else if (c.selector === '$$value') {
          value = JSON.stringify(r);
        }
        value = getValue(value, c.type);
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
          timestamp = getValue(get(r, FirstTimeColumn.selector) + '', FirstTimeColumn.type, true) as number;
        }
        let metric = getValue(get(r, metricColumn.selector), 'number') as number;
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
