# E2E Tests for Grafana Infinity Datasource

This directory contains end-to-end tests using Playwright and `@grafana/plugin-e2e`.

## Running Tests

```bash
yarn e2e
```

## Combobox Component Testing Pattern

After migrating from the deprecated `Select` component to `Combobox`, the test interaction pattern has changed:

### ❌ Old Pattern (Select component)
```typescript
await page.getByTestId('my-selector').click();
const select = page.getByLabel('Select options menu');
await select.locator(page.getByText('My Option')).click();
```

### ✅ New Pattern (Combobox component)
```typescript
// Click the Combobox to open the dropdown
await page.getByTestId('my-selector').click();

// Click the option directly using getByRole
await page.getByRole('option', { name: 'My Option' }).click();
```

## Key Differences

1. **No intermediate selector needed**: Combobox options are directly accessible via `getByRole('option')`
2. **Simpler syntax**: Two steps instead of three
3. **More semantic**: Uses ARIA roles for better accessibility testing

## Test Files

- `smoke.spec.ts` - Basic plugin loading test
- `configeditor.spec.ts` - Config editor functionality tests
- `queryeditor.spec.ts` - Query editor Combobox interaction tests

## Adding New Tests

When adding tests for new Combobox components:

1. Identify the `data-testid` attribute of the Combobox container
2. Click it to open the dropdown
3. Use `page.getByRole('option', { name: 'Option Name' })` to select an option
4. Add assertions to verify the selection worked

Example:
```typescript
test('should select format', async ({ createDataSourceConfigPage, page }) => {
    await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });
    
    // Open Combobox
    await page.getByTestId('infinity-query-format-selector').click();
    
    // Select option
    await page.getByRole('option', { name: 'Time Series' }).click();
    
    // Verify
    await expect(page.getByTestId('infinity-query-format-selector')).toBeVisible();
});
```
