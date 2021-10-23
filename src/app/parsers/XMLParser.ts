import { forEach, get } from 'lodash';
import { parseString } from 'xml2js';
import { InfinityParser } from './InfinityParser';
import { getValue } from './utils';
import { InfinityColumn, GrafanaTableRow, InfinityXMLQuery } from './../../types';

export class XMLParser extends InfinityParser<InfinityXMLQuery> {
  constructor(XMLResponse: any | string, target: InfinityXMLQuery, endTime?: Date) {
    super(target);
    this.formatInput(XMLResponse).then((xmlResponse: any) => {
      if (this.target.root_selector) {
        xmlResponse = get(xmlResponse, this.target.root_selector);
      }
      if (Array.isArray(xmlResponse)) {
        this.constructTableData(xmlResponse);
        this.constructTimeSeriesData(xmlResponse, endTime);
      } else {
        this.constructSingleTableData(xmlResponse);
      }
    });
  }
  private formatInput(XMLResponse: string) {
    return new Promise((resolve, reject) => {
      parseString(XMLResponse, (err, res) => {
        resolve(res);
      });
    });
  }
  private constructTableData(XMLResponse: any[]) {
    forEach(XMLResponse, (r) => {
      const row: GrafanaTableRow = [];
      this.target.columns.forEach((c: InfinityColumn) => {
        let value = get(r, c.selector, '');
        value = getValue(value, c.type);
        if (typeof r === 'string') {
          row.push(r);
        } else {
          if (['string', 'number', 'boolean'].includes(typeof value)) {
            row.push(value);
          } else if (value && typeof value.getMonth === 'function') {
            row.push(value);
          } else {
            if (value && Array.isArray(value)) {
              row.push(value.join(','));
            } else {
              row.push(JSON.stringify(value));
            }
          }
        }
      });
      this.rows.push(row);
    });
  }
  private constructTimeSeriesData(XMLResponse: object, endTime: Date | undefined) {
    this.NumbersColumns.forEach((metricColumn: InfinityColumn) => {
      forEach(XMLResponse, (r) => {
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
          timestamp = getValue(get(r, FirstTimeColumn.selector) + '', FirstTimeColumn.type) as number;
        }
        let metric = getValue(get(r, metricColumn.selector), 'number') as number;
        this.series.push({
          target: seriesName,
          datapoints: [[metric, timestamp]],
        });
      });
    });
  }
  private constructSingleTableData(XMLResponse: object) {
    const row: GrafanaTableRow = [];
    this.target.columns.forEach((c: InfinityColumn) => {
      row.push(get(XMLResponse, c.selector, ''));
    });
    this.rows.push(row);
  }
}
