import { expect, test } from '@grafana/plugin-e2e';
import type { BackendDataSourceResponse } from '@grafana/runtime';

const DATA_SOURCE_NAME = 'Infinity';

test.describe('Query editor', () => {
  test.beforeEach(async ({ panelEditPage }) => {
    await panelEditPage.datasource.set(DATA_SOURCE_NAME);
  });

  test('smoke: should render the query editor', { tag: '@plugins' }, async ({ panelEditPage }) => {
    const queryEditor = panelEditPage.getQueryEditorRow('A');

    await expect(queryEditor.getByTestId('infinity-query-editor')).toBeVisible();
    await expect(queryEditor.getByTestId('infinity-query-field-wrapper-type').getByRole('combobox')).toBeVisible();
    await expect(queryEditor.getByTestId('infinity-query-field-wrapper-source').getByRole('combobox')).toBeVisible();
  });

  test('should query provisioned reference data', async ({ panelEditPage }) => {
    const queryEditor = panelEditPage.getQueryEditorRow('A');
    const source = queryEditor.getByTestId('infinity-query-field-wrapper-source').getByRole('combobox');

    await source.click();
    await source.fill('Reference');
    await source.press('ArrowDown');
    await source.press('Enter');

    const reference = queryEditor.getByTestId('infinity-query-field-wrapper-reference').getByRole('combobox');
    await expect(reference).toBeVisible();
    await reference.click();
    await reference.fill('users.json');
    await reference.press('ArrowDown');
    await reference.press('Enter');

    await panelEditPage.setVisualization('Table');
    const response = await panelEditPage.refreshPanel();
    const responseBody = (await response.json()) as BackendDataSourceResponse;
    const result = responseBody.results.A;
    const frame = result.frames?.[0];
    const fieldNames = frame?.schema.fields.map((field) => field.name);
    const nameFieldIndex = fieldNames?.indexOf('name');

    expect(response.ok()).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.frames).toHaveLength(1);
    expect(fieldNames).toEqual(expect.arrayContaining(['name', 'age', 'country', 'occupation', 'salary']));
    expect(nameFieldIndex).toBeGreaterThanOrEqual(0);
    expect(frame?.data.values[nameFieldIndex ?? -1]).toContain('Leanne Graham');
    await expect(panelEditPage.panel.fieldNames.filter({ hasText: /^name$/ })).toHaveCount(1);
    await expect(panelEditPage.panel.data.filter({ hasText: /^Leanne Graham$/ })).toHaveCount(1);
  });
});
