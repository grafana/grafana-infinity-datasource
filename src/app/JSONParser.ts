import { forEach, get } from 'lodash';
import { InfinityQuery, ScrapColumn } from "./../types";

export class JSONParser {
    private rows: any[];
    constructor(HTMLResponse: object, private target: InfinityQuery) {
        this.rows = [];
        if (typeof HTMLResponse === 'string') {
            HTMLResponse = JSON.parse(HTMLResponse)
        }
        if (target.root_selector) {
            HTMLResponse = get(HTMLResponse, target.root_selector);
        }
        if (Array.isArray(HTMLResponse)) {
            forEach(HTMLResponse, r => {
                const row: any[] = [];
                target.columns.forEach((c: ScrapColumn) => {
                    row.push(get(r, c.selector, ""));
                });
                this.rows.push(row);
            });
        } else {
            const row: any[] = [];
            target.columns.forEach((c: ScrapColumn) => {
                row.push(get(HTMLResponse, c.selector, ""));
            });
            this.rows.push(row);
        }
    }
    toTable() {
        return {
            rows: this.rows.filter(row => row.length > 0),
            columns: this.target.columns
        }
    }
}