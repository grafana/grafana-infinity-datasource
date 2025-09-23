import { test, expect } from '@grafana/plugin-e2e';

test('Config editor: should be able to add a global query', async ({ createDataSourceConfigPage, page }) => {
    await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });
    await page.getByRole('button', { name: 'Global queries' }).click();
    await page.getByRole('button', { name: 'Add Global Query' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    await page.getByTestId('infinity-query-source-selector').click();
    const select = page.getByLabel('Select options menu');
    await select.locator(page.getByText('Reference')).click();

    expect(await page.getByTestId('infinity-query-field-label-reference')).toBeVisible();
});
