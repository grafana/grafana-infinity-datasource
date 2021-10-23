import { forEach } from 'lodash';
import { load } from 'cheerio';
import { InfinityParser } from './InfinityParser';
import { getValue } from './utils';
import { InfinityColumn, GrafanaTableRow, GrafanaTableRowItem, InfinityHTMLQuery } from './../../types';

export class HTMLParser extends InfinityParser<InfinityHTMLQuery> {
  constructor(HTMLResponse: string, target: InfinityHTMLQuery, endTime?: Date) {
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
        value = getValue(value, c.type);
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
          timestamp = getValue($$(FirstTimeColumn.selector).text().trim(), FirstTimeColumn.type, true) as number;
        }
        if (seriesName) {
          let metric = getValue($$(metricColumn.selector).text().trim().replace(/\,/g, ''), 'number') as number;
          this.series.push({
            target: seriesName,
            datapoints: [[metric, timestamp]],
          });
        }
      });
    });
  }
}
