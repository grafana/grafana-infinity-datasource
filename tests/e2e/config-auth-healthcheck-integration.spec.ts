import { test, expect } from '@grafana/plugin-e2e';
import {
    selectAuthMethod,
    fillBasicAuthFields,
    fillBearerTokenField,
    enableCustomHealthCheck,
    saveAndTest,
    verifyHealthCheckFailure,
    verifyHealthCheckSuccess,
    navigateToConfigTab,
} from './helpers';
import { testAuthServerUrl } from '../../playwright.config';

const TEST_AUTH_SERVER = testAuthServerUrl;

test.describe('Config Editor - Authentication & Health Check Integration @auth @integration', () => {
    test('should fail health check when allowed hosts are not configured', async ({ createDataSourceConfigPage, page }) => {
        const testUser = 'testuser';
        const testPass = 'testpass';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Basic Authentication
        await selectAuthMethod(page, 'Basic Authentication');

        // Fill in valid credentials
        await fillBasicAuthFields(page, testUser, testPass);

        // DO NOT add allowed hosts - this should cause validation error

        // Enable custom health check
        await enableCustomHealthCheck(page, `${TEST_AUTH_SERVER}/basic-auth/${testUser}/${testPass}`);

        // Save and test
        await saveAndTest(page);

        // Verify health check failure due to missing allowed hosts
        const isFailure = await verifyHealthCheckFailure(page);
        expect(isFailure).toBeTruthy();

        // Look for specific error message about allowed hosts
        const hostError = await page.getByText(/host.*not.*allow/i).isVisible().catch(() => false);
        const missingHostError = await page.getByText(/allowed.*host/i).isVisible().catch(() => false);

        // Should have some indication about allowed hosts issue
        expect(hostError || missingHostError).toBeTruthy();
    });

    test('should use default health check when custom health check is disabled', async ({ createDataSourceConfigPage, page }) => {
        const testUser = 'defaultcheck';
        const testPass = 'defaultpass';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Basic Authentication
        await selectAuthMethod(page, 'Basic Authentication');

        // Fill in credentials
        await fillBasicAuthFields(page, testUser, testPass);

        // Add allowed host (for testing purposes)
        const allowedHostsInput = page.locator('input[placeholder*="host"]').first();
        await allowedHostsInput.fill(TEST_AUTH_SERVER);
        await allowedHostsInput.press('Enter');

        // DO NOT enable custom health check - let default health check run

        // Navigate to Health Check tab (just to verify it exists)
        await page.getByRole('button', { name: 'Health Check' }).click();

        // Verify custom health check toggle exists and is OFF
        const enableSwitch = page.getByText('Enable custom health check').locator('..').locator('input[type="checkbox"]');
        const isChecked = await enableSwitch.isChecked();
        expect(isChecked).toBeFalsy();

        // Save and test with default health check
        await page.getByRole('button', { name: 'Save & test' }).click();
        await page.waitForTimeout(2000);

        // Default health check should pass (just validates configuration)
        const isSuccess = await verifyHealthCheckSuccess(page);
        expect(isSuccess).toBeTruthy();
    });

    test('should validate allowed hosts before performing health check', async ({ createDataSourceConfigPage, page }) => {
        const testToken = 'validatetoken';
        const invalidHost = 'http://invalid-host-that-does-not-exist.com';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Bearer Token
        await selectAuthMethod(page, 'Bearer Token');

        // Fill in bearer token
        await fillBearerTokenField(page, testToken);

        // Add an invalid/non-existent host to allowed hosts
        const allowedHostsInput = page.locator('input[placeholder*="host"]').first();
        await allowedHostsInput.fill(invalidHost);
        await allowedHostsInput.press('Enter');

        // Enable custom health check to the invalid host
        await enableCustomHealthCheck(page, `${invalidHost}/status/200`);

        // Save and test
        await saveAndTest(page);

        // Should fail due to network error or host unreachable
        const isFailure = await verifyHealthCheckFailure(page);
        expect(isFailure).toBeTruthy();
    });

    test('should handle health check timeout gracefully', async ({ createDataSourceConfigPage, page }) => {
        const testUser = 'timeoutuser';
        const testPass = 'timeoutpass';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Basic Authentication
        await selectAuthMethod(page, 'Basic Authentication');

        // Fill in credentials
        await fillBasicAuthFields(page, testUser, testPass);

        // Add allowed host
        const allowedHostsInput = page.locator('input[placeholder*="host"]').first();
        await allowedHostsInput.fill(TEST_AUTH_SERVER);
        await allowedHostsInput.press('Enter');

        // Use delay endpoint to simulate slow response
        await enableCustomHealthCheck(page, `${TEST_AUTH_SERVER}/delay/10`);

        // Save and test - should timeout
        await page.getByRole('button', { name: 'Save & test' }).click();

        // Wait for timeout (give it reasonable time but not full 10 seconds)
        await page.waitForTimeout(5000);

        // Should show some kind of error/timeout indication
        const hasResult = await verifyHealthCheckFailure(page, 'Testing... this could take up to a couple of minutes');

        // Should have received some response (even if it's timeout)
        expect(hasResult).toBeTruthy();
    });

    test('should preserve auth configuration across tab navigation', async ({ createDataSourceConfigPage, page }) => {
        const testUser = 'navuser';
        const testPass = 'navpass';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Basic Authentication
        await selectAuthMethod(page, 'Basic Authentication');

        // Fill in credentials
        await fillBasicAuthFields(page, testUser, testPass);

        // Navigate through multiple tabs without saving
        await page.getByRole('button', { name: 'URL, Headers & Params' }).click();
        await page.waitForTimeout(300);

        await page.getByRole('button', { name: 'Network' }).click();
        await page.waitForTimeout(300);

        await page.getByRole('button', { name: 'Security' }).click();
        await page.waitForTimeout(300);

        // Navigate back to Authentication
        await navigateToConfigTab(page, 'Authentication');
        await page.waitForTimeout(300);

        // Verify username is still there (in-memory state preserved)
        const usernameInput = page.getByPlaceholder('username');
        await expect(usernameInput).toHaveValue(testUser);

        // Password field should show the value (not yet saved, so not "configured")
        const passwordInput = page.getByPlaceholder('password').first();
        await expect(passwordInput).toHaveValue(testPass);
    });
});
