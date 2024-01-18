import { Page, Locator } from '@playwright/test';
import { PanelEditPage, expect } from '@grafana/plugin-e2e';

export const runQuery = async (page: Page, panelEditPage: PanelEditPage, locator: Locator, query: Record<string, any>) => {
  if (query.type) {
    const typeDropdown = await locator.locator(`[data-testid='infinity-query-field-wrapper-type'] input`);
    await typeDropdown.clear();
    await typeDropdown.fill(query.type || 'json');
    await page.keyboard.press('Enter');
  }
  if (query.source) {
    const sourceDropdown = await locator.locator(`[data-testid='infinity-query-field-wrapper-source'] input`);
    await sourceDropdown.clear();
    await sourceDropdown.fill(query.source || 'url');
    await page.keyboard.press('Enter');
  }
  if (query.parser) {
    const parserDropdown = await locator.locator(`[data-testid='infinity-query-field-wrapper-parser'] input`);
    await parserDropdown.clear();
    await parserDropdown.fill(query.parser || 'simple');
    await page.keyboard.press('Enter');
  }
  if (query.url) {
    const urlTextBox = await locator.locator(`[data-testid='infinity-query-field-wrapper-url'] input`);
    await urlTextBox.clear();
    await urlTextBox.fill(query.url || 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.json');
    await page.keyboard.press('Enter');
  }
  const res = await panelEditPage.refreshPanel();
  await expect(panelEditPage).not.toHavePanelError();
  const frames = await res.json();
  return frames;
};
