import { test, expect } from '@grafana/plugin-e2e';

test('Config editor: should be able to add a global query', async ({ createDataSourceConfigPage, page }) => {
    await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });
    await page.getByRole('button', { name: 'Global queries' }).click();
    await page.getByRole('button', { name: 'Add Global Query' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    const sourceDropdown = await page.getByTestId('infinity-query-source-selector');
    await sourceDropdown.click();
    await sourceDropdown.fill('Reference');
    await sourceDropdown.press('ArrowDown');
    await sourceDropdown.press('Enter');
    expect(await page.getByTestId('infinity-query-field-label-reference')).toBeVisible();
});
