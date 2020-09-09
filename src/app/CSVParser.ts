import { forEach, get } from 'lodash';
import parse from "csv-parse/lib/sync";
import { InfinityQuery, ScrapColumn } from "./../types";

export class CSVParser {
    private rows: any[];
    constructor(HTMLResponse: string, private target: InfinityQuery) {
        this.rows = [];
        const options = {
            columns: true,
            skip_empty_lines: true
        };
        const records = parse(HTMLResponse, options);
        if (Array.isArray(records)) {
            forEach(records, r => {
                const row: any[] = [];
                target.columns.forEach((c: ScrapColumn) => {
                    row.push(get(r, c.selector, ""));
                });
                this.rows.push(row);
            });
        }
    }
    toTable() {
        return {
            rows: this.rows.filter(row => row.length > 0),
            columns: this.target.columns
        }
    }
}