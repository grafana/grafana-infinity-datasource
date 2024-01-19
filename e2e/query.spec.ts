import { test, expect } from '@grafana/plugin-e2e';
import { runQuery } from './query';

test('test type:json source:url', async ({ page, panelEditPage }) => {
  await panelEditPage.datasource.set('Infinity');
  await panelEditPage.setVisualization('Table');
  const options = { page, panelEditPage };

  let frames = await runQuery({}, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe(''); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].schema.meta.custom.data[0].country).toBe('USA'); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery({ parser: 'backend' }, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('backend'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].data.values[1][0]).toBe('USA'); // Ensure actual data frames being returned
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery({ parser: 'uql' }, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('uql'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].schema.meta.custom.data[0].country).toBe('USA'); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery({ parser: 'groq' }, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('groq'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].schema.meta.custom.data[0].country).toBe('USA'); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered
});

test('test type:csv source:url', async ({ page, panelEditPage }) => {
  await panelEditPage.datasource.set('Infinity');
  await panelEditPage.setVisualization('Table');
  const options = { page, panelEditPage };

  let frames = await runQuery({ type: 'csv', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.csv' }, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe(''); // Ensure the parser type passed correctly
  expect((frames.results['A'].frames[0].schema.meta.custom.data || '').startsWith('name,age,country,occupation,salary')).toBeTruthy(); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery({ type: 'csv', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.csv', parser: 'backend' }, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('backend'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].data.values[1][0]).toBe('USA'); // Ensure actual data frames being returned
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery({ type: 'csv', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.csv', parser: 'uql' }, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('uql'); // Ensure the parser type passed correctly
  expect((frames.results['A'].frames[0].schema.meta.custom.data || '').startsWith('name,age,country,occupation,salary')).toBeTruthy(); // Ensure schema meta have actual data to be passed to the frontend
  await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered
});

test('test type:xml source:url', async ({ page, panelEditPage }) => {
  await panelEditPage.datasource.set('Infinity');
  await panelEditPage.setVisualization('Table');
  const options = { page, panelEditPage };

  let frames = await runQuery({ type: 'xml', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.xml' }, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe(''); // Ensure the parser type passed correctly
  expect((frames.results['A'].frames[0].schema.meta.custom.data || '').includes('<name>Leanne Graham</name')).toBeTruthy(); // Ensure schema meta have actual data to be passed to the frontend
  // await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery({ type: 'xml', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.xml', parser: 'backend' }, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('backend'); // Ensure the parser type passed correctly
  expect(frames.results['A'].frames[0].data.values[0][0].includes('Leanne Graham')).toBeTruthy(); // Ensure actual data frames being returned
  // await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered

  frames = await runQuery({ type: 'xml', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.xml', parser: 'uql' }, options);
  expect(frames.results['A'].frames[0].schema.meta.custom.query.parser).toBe('uql'); // Ensure the parser type passed correctly
  expect((frames.results['A'].frames[0].schema.meta.custom.data || '').includes('<name>Leanne Graham</name')).toBeTruthy(); // Ensure schema meta have actual data to be passed to the frontend
  // await expect(page.getByText('Patricia Lebsack')).toBeVisible(); // Ensure actual data rendered
});
