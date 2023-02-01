import { request, query } from './utils/api';
import type { InfinityQuery } from './../../src/types';

describe('sanity check', () => {
  it('health check', () => {
    request('/datasources/2/health').then((res) => {
      // @ts-ignore
      cy.wrap(res.body).snapshot();
    });
  });
});

describe('test the backend response', () => {
  const queries: Array<{ name: string; query: Partial<Extract<InfinityQuery, { parser: 'backend' }>> }> = [
    {
      name: 'backend json query',
      query: {
        type: 'json',
        parser: 'backend',
        source: 'inline',
        data: JSON.stringify([
          { name: 'foo', age: 30 },
          { name: 'bar', age: 17 },
        ]),
      },
    },
    {
      name: 'backend csv query',
      query: {
        type: 'csv',
        parser: 'backend',
        source: 'inline',
        data: 'name,age\nfoo,30\nbar,17',
      },
    },
    {
      name: 'backend tsv query',
      query: {
        type: 'tsv',
        parser: 'backend',
        source: 'inline',
        data: 'name  age\nfoo  30\nbar 17',
      },
    },
    {
      name: 'backend graphql query',
      query: {
        type: 'graphql',
        parser: 'backend',
        source: 'inline',
        data: JSON.stringify([
          { name: 'foo', age: 30 },
          { name: 'bar', age: 17 },
        ]),
      },
    },
    {
      name: 'backend xml query',
      query: {
        type: 'xml',
        parser: 'backend',
        source: 'inline',
        data: `<?xml version="1.0" encoding="UTF-8" ?> <root>   <row>     <name>foo</name>     <age>30</age>   </row>   <row>     <name>bar</name>     <age>17</age>   </row> </root>`,
      },
    },
    {
      name: 'backend xml query with root selector and columns',
      query: {
        type: 'xml',
        parser: 'backend',
        source: 'inline',
        data: `<?xml version="1.0" encoding="UTF-8" ?> <root>   <row>     <name>foo</name>     <age>30</age>   </row>   <row>     <name>bar</name>     <age>17</age>   </row> </root>`,
        root_selector: 'root.row',
        columns: [
          {
            text: 'Age',
            selector: 'age',
            type: 'number',
          },
          {
            text: 'Name',
            selector: 'name',
            type: 'string',
          },
        ],
      },
    },
    {
      name: 'backend html query',
      query: {
        type: 'html',
        parser: 'backend',
        source: 'inline',
        data: `<table class="table table-bordered table-hover table-condensed"> <thead><tr><th title="Field #1">name</th> <th title="Field #2">age</th> </tr></thead> <tbody><tr> <td>foo</td> <td align="right">30</td> </tr> <tr> <td>bar</td> <td align="right">17</td> </tr> </tbody></table>`,
      },
    },
    {
      name: 'backend html query with root selector and columns',
      query: {
        type: 'html',
        parser: 'backend',
        source: 'inline',
        data: `<table class="table table-bordered table-hover table-condensed"> <thead><tr><th title="Field #1">name</th> <th title="Field #2">age</th> </tr></thead> <tbody><tr> <td>foo</td> <td align="right">30</td> </tr> <tr> <td>bar</td> <td align="right">17</td> </tr> </tbody></table>`,
        root_selector: 'table.tbody.tr',
        columns: [
          {
            text: 'Name',
            selector: 'td.0',
            type: 'string',
          },
          {
            text: 'Age',
            selector: 'td.1.#content',
            type: 'number',
          },
        ],
      },
    },
  ];
  queries.forEach((q) => {
    it(q.name, () => {
      query(q.query).then((res) => {
        cy.wrap({
          ...res.body.results['A'].frames[0],
          schema: {
            ...res.body.results['A'].frames[0].schema,
            meta: {
              ...res.body.results['A'].frames[0].schema.meta,
              custom: {
                ...res.body.results['A'].frames[0].schema.meta.custom,
                duration: 0,
              },
            },
          },
          // @ts-ignore
        }).snapshot();
      });
    });
  });
});

describe('test the uql response', () => {
  const queries: Array<{ name: string; query: Partial<Extract<InfinityQuery, { parser: 'uql' }>> }> = [
    {
      name: 'uql json query',
      query: {
        type: 'json',
        parser: 'uql',
        source: 'inline',
        uql: 'parse-json',
        data: JSON.stringify([
          { name: 'foo', age: 30 },
          { name: 'bar', age: 17 },
        ]),
      },
    },
    {
      name: 'uql csv query',
      query: {
        type: 'csv',
        parser: 'uql',
        source: 'inline',
        uql: 'parse-csv',
        data: 'name,age\nfoo,30\nbar,17',
      },
    },
    {
      name: 'uql tsv query',
      query: {
        type: 'tsv',
        parser: 'uql',
        source: 'inline',
        data: 'name  age\nfoo  30\nbar 17',
      },
    },
    {
      name: 'uql graphql query',
      query: {
        type: 'graphql',
        parser: 'uql',
        source: 'inline',
        uql: 'parse-json',
        data: JSON.stringify([
          { name: 'foo', age: 30 },
          { name: 'bar', age: 17 },
        ]),
      },
    },
    {
      name: 'uql xml query',
      query: {
        type: 'xml',
        parser: 'uql',
        source: 'inline',
        uql: 'parse-json',
        data: `<?xml version="1.0" encoding="UTF-8" ?> <root>   <row>     <name>foo</name>     <age>30</age>   </row>   <row>     <name>bar</name>     <age>17</age>   </row> </root>`,
      },
    },
  ];
  queries.forEach((q) => {
    it(q.name, () => {
      query(q.query).then((res) => {
        cy.wrap({
          ...res.body.results['A'].frames[0],
          schema: {
            ...res.body.results['A'].frames[0].schema,
            meta: {
              ...res.body.results['A'].frames[0].schema.meta,
              custom: {
                ...res.body.results['A'].frames[0].schema.meta.custom,
                duration: 0,
              },
            },
          },
          // @ts-ignore
        }).snapshot();
      });
    });
  });
});
