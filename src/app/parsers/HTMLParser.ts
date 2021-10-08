import { forEach, toNumber } from 'lodash';
import { load } from 'cheerio';
import { InfinityParser } from './InfinityParser';
import { InfinityQuery, InfinityColumn, GrafanaTableRow, GrafanaTableRowItem } from './../../types';

export class HTMLParser extends InfinityParser {
  constructor(HTMLResponse: string, target: InfinityQuery, endTime?: Date) {
    super(target);
    const rootElements = this.formatInput(HTMLResponse);
    this.constructTableData(rootElements);
    this.constructTimeSeriesData(rootElements, endTime);
  }
  private formatInput(HTMLResponse: string) {
    const $ = load(HTMLResponse);
    const rootElements = $(this.target.root_selector);
    return rootElements;
  }
  private constructTableData(rootElements: cheerio.Cheerio) {
    forEach(rootElements, (r) => {
      const row: GrafanaTableRow = [];
      const $ = load(r);
      this.target.columns.forEach((c: InfinityColumn) => {
        let value: GrafanaTableRowItem = $(c.selector).text().trim();
        if (c.type === 'number') {
          value = value === '' ? null : +value;
        } else if (c.type === 'timestamp') {
          value = new Date(value);
        } else if (c.type === 'timestamp_epoch') {
          value = new Date(parseInt(value, 10));
        } else if (c.type === 'timestamp_epoch_s') {
          value = new Date(parseInt(value, 10) * 1000);
        }
        row.push(value);
      });
      this.rows.push(row);
    });
  }
  private constructTimeSeriesData(rootElements: cheerio.Cheerio, endTime: Date | undefined) {
    this.NumbersColumns.forEach((metricColumn: InfinityColumn) => {
      forEach(rootElements, (r) => {
        const $$ = load(r);
        let seriesName = this.StringColumns.map((c) => $$(c.selector).text()).join(' ');
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
            timestamp = new Date($$(FirstTimeColumn.selector).text().trim()).getTime();
          } else if (FirstTimeColumn.type === 'timestamp_epoch') {
            timestamp = new Date(parseInt($$(FirstTimeColumn.selector).text().trim(), 10)).getTime();
          } else if (FirstTimeColumn.type === 'timestamp_epoch_s') {
            timestamp = new Date(parseInt($$(FirstTimeColumn.selector).text().trim(), 10) * 1000).getTime();
          }
        }
        if (seriesName) {
          let metric = toNumber($$(metricColumn.selector).text().trim().replace(/\,/g, ''));
          this.series.push({
            target: seriesName,
            datapoints: [[metric, timestamp]],
          });
        }
      });
    });
  }
}
