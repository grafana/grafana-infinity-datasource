import { test, expect } from '@grafana/plugin-e2e';
import { runQuery } from './query';

test('test type:json source:url', async ({ page, panelEditPage }) => {
  await panelEditPage.datasource.set('Infinity');
  await panelEditPage.setVisualization('Table');
  const queryEditorRow = await panelEditPage.getQueryEditorRow('A');

  let frames = await runQuery(page, panelEditPage, queryEditorRow, {});
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe(''); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].schema.meta.custom.data[0].country).toBe('USA'); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery(page, panelEditPage, queryEditorRow, { parser: 'backend' });
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('backend'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].data.values[1][0]).toBe('USA'); // Ensure actual data frames being returned
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery(page, panelEditPage, queryEditorRow, { parser: 'uql' });
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('uql'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].schema.meta.custom.data[0].country).toBe('USA'); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery(page, panelEditPage, queryEditorRow, { parser: 'groq' });
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('groq'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].schema.meta.custom.data[0].country).toBe('USA'); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered
});

test('test type:csv source:url', async ({ page, panelEditPage }) => {
  await panelEditPage.datasource.set('Infinity');
  await panelEditPage.setVisualization('Table');
  const queryEditorRow = await panelEditPage.getQueryEditorRow('A');

  let frames = await runQuery(page, panelEditPage, queryEditorRow, { type: 'csv', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.csv' });
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe(''); // Ensure the parser type passed correctly
  expect((frames.results['A'].frames[0].schema.meta.custom.data || '').startsWith('name,age,country,occupation,salary')).toBeTruthy(); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery(page, panelEditPage, queryEditorRow, { type: 'csv', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.csv', parser: 'backend' });
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('backend'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].data.values[1][0]).toBe('USA'); // Ensure actual data frames being returned
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery(page, panelEditPage, queryEditorRow, { type: 'csv', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.csv', parser: 'uql' });
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('uql'); // Ensure the parser type passed correctly
  expect((frames.results['A'].frames[0].schema.meta.custom.data || '').startsWith('name,age,country,occupation,salary')).toBeTruthy(); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered
});

test('test type:xml source:url', async ({ page, panelEditPage }) => {
  await panelEditPage.datasource.set('Infinity');
  await panelEditPage.setVisualization('Table');
  const queryEditorRow = await panelEditPage.getQueryEditorRow('A');

  let frames = await runQuery(page, panelEditPage, queryEditorRow, { type: 'xml', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.xml' });
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe(''); // Ensure the parser type passed correctly
  expect((frames.results['A'].frames[0].schema.meta.custom.data || '').includes('<name>Leanne Graham</name')).toBeTruthy(); // Ensure schema meta have actual data to be passed to the frontend
  // await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery(page, panelEditPage, queryEditorRow, { type: 'xml', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.xml', parser: 'backend' });
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('backend'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].data.values[0][0].includes('Leanne Graham')).toBeTruthy(); // Ensure actual data frames being returned
  // await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery(page, panelEditPage, queryEditorRow, { type: 'xml', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.xml', parser: 'uql' });
  expect(frames.results['A'].frames[0].schema.name).toBe('A');
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('uql'); // Ensure the parser type passed correctly
  expect((frames.results['A'].frames[0].schema.meta.custom.data || '').includes('<name>Leanne Graham</name')).toBeTruthy(); // Ensure schema meta have actual data to be passed to the frontend
  // await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered
});
