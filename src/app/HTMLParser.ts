import { forEach } from 'lodash';
import { load } from 'cheerio';
import { InfinityQuery, ScrapColumn } from "./../types";

export class HTMLParser {
    private rows: any[];
    constructor(HTMLResponse: string, private target: InfinityQuery) {
        this.rows = [];
        const $ = load(HTMLResponse);
        const rootElements = $(target.root_selector);
        forEach(rootElements, r => {
            const row: any[] = [];
            const $$ = load(r);
            target.columns.forEach((c: ScrapColumn) => {
                row.push($$(c.selector).text().trim());
            });
            this.rows.push(row);
        });
    }
    toTable() {
        return {
            rows: this.rows.filter(row => row.length > 0),
            columns: this.target.columns
        }
    }
}