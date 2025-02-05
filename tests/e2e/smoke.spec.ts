import { test, expect } from '@grafana/plugin-e2e';

test('Smoke test: plugin loads', async ({ createDataSourceConfigPage, page }) => {
  await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

  await expect(await page.getByText('Type: Infinity', { exact: true })).toBeVisible();
  await expect(await page.getByRole('heading', { name: '👋 Welcome to Grafana Infinity Data Source!', exact: true })).toBeVisible();
});
