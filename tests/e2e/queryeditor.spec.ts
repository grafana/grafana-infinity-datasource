import { test, expect } from '@grafana/plugin-e2e';

test('Config editor: should be able to add and configure a global query with different formats', async ({ createDataSourceConfigPage, page }) => {
    await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });
    await page.getByRole('button', { name: 'Global queries' }).click();
    await page.getByRole('button', { name: 'Add Global Query' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    // Test 1: Change source to Inline
    await page.getByTestId('infinity-query-source-selector').click();
    await page.getByRole('option', { name: 'Inline' }).click();
    
    // Verify inline data field appears
    await expect(page.getByTestId('infinity-query-inline-data-selector')).toBeVisible();
    
    // Test 2: Change back to URL source
    await page.getByTestId('infinity-query-source-selector').click();
    await page.getByRole('option', { name: 'URL' }).click();
});

test('Config editor: should be able to change query format types', async ({ createDataSourceConfigPage, page }) => {
    await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });
    await page.getByRole('button', { name: 'Global queries' }).click();
    await page.getByRole('button', { name: 'Add Global Query' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    // Click the format selector Combobox
    await page.getByTestId('infinity-query-format-selector').click();
    
    // Select Time Series format
    await page.getByRole('option', { name: 'Time Series' }).click();
    
    // Change format again to Logs
    await page.getByTestId('infinity-query-format-selector').click();
    await page.getByRole('option', { name: 'Logs' }).click();
    
    // Verify we can see format-related fields
    const formatSelector = page.getByTestId('infinity-query-format-selector');
    await expect(formatSelector).toBeVisible();
});


