import { test, expect } from '@grafana/plugin-e2e';
import {
    selectAuthMethod,
    fillBearerTokenField,
    addAllowedHost,
    enableCustomHealthCheck,
    saveAndTest,
    verifyHealthCheckSuccess,
    verifyHealthCheckFailure,
    navigateToConfigTab,
} from './helpers';
import { testAuthServerUrl } from '../../playwright.config';

const TEST_AUTH_SERVER = testAuthServerUrl;

test.describe('Config Editor - Bearer Token Authentication @auth @auth-bearer', () => {
    test('should pass health check with valid bearer token', async ({ createDataSourceConfigPage, page }) => {
        const testToken = 'valid-test-token-12345';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Bearer Token
        await selectAuthMethod(page, 'Bearer Token');

        // Fill in bearer token
        await fillBearerTokenField(page, testToken);

        // Add allowed host
        await addAllowedHost(page, TEST_AUTH_SERVER);

        // Enable custom health check with bearer endpoint
        await enableCustomHealthCheck(page, `${TEST_AUTH_SERVER}/bearer`);

        // Save and test
        await saveAndTest(page);

        // Verify health check success
        const isSuccess = await verifyHealthCheckSuccess(page);
        expect(isSuccess).toBeTruthy();
    });

    test('should fail health check with missing bearer token', async ({ createDataSourceConfigPage, page }) => {
        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Bearer Token
        await selectAuthMethod(page, 'Bearer Token');

        // Leave bearer token empty
        await fillBearerTokenField(page, '');

        // Add allowed host
        await addAllowedHost(page, TEST_AUTH_SERVER);

        // Enable custom health check
        await enableCustomHealthCheck(page, `${TEST_AUTH_SERVER}/bearer`);

        // Save and test
        await saveAndTest(page);

        // Verify health check failure
        const isFailure = await verifyHealthCheckFailure(page);
        expect(isFailure).toBeTruthy();
    });

    test('should allow switching from bearer to another auth method', async ({ createDataSourceConfigPage, page }) => {
        const testToken = 'switch-token-123';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Bearer Token
        await selectAuthMethod(page, 'Bearer Token');

        // Fill in bearer token
        await fillBearerTokenField(page, testToken);

        // Add allowed host
        await addAllowedHost(page, TEST_AUTH_SERVER);

        // Save
        await page.getByRole('button', { name: 'Save & test' }).click();
        await page.waitForTimeout(1000);

        // Switch to Basic Authentication
        await selectAuthMethod(page, 'Basic Authentication');

        // Wait for UI to update
        await page.waitForTimeout(500);

        // Verify bearer token field is no longer visible
        const tokenInput = page.getByPlaceholder('bearer token');
        const isTokenVisible = await tokenInput.isVisible().catch(() => false);
        expect(isTokenVisible).toBeFalsy();

        // Verify basic auth fields are now visible
        const usernameInput = page.getByPlaceholder('username');
        const isUsernameVisible = await usernameInput.isVisible();
        expect(isUsernameVisible).toBeTruthy();
    });
});
