import { test, expect } from '@grafana/plugin-e2e';
import {
    selectAuthMethod,
    fillDigestAuthFields,
    addAllowedHost,
    enableCustomHealthCheck,
    saveAndTest,
    verifyHealthCheckSuccess,
    verifyHealthCheckFailure,
    navigateToConfigTab,
} from './helpers';
import { testAuthServerUrl } from '../../playwright.config';

const TEST_AUTH_SERVER = testAuthServerUrl;

test.describe('Config Editor - Digest Authentication @auth @auth-digest', () => {
    test('should pass health check with valid digest auth credentials', async ({ createDataSourceConfigPage, page }) => {
        const testUser = 'digestuser';
        const testPass = 'digestpass';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Digest Auth
        await selectAuthMethod(page, 'Digest Auth');

        // Fill in credentials
        await fillDigestAuthFields(page, testUser, testPass);

        // Add allowed host
        await addAllowedHost(page, TEST_AUTH_SERVER);

        // Enable custom health check with digest auth endpoint
        // go-httpbin format: /digest-auth/{qop}/{user}/{pass} where qop = "auth" or "auth-int"
        await enableCustomHealthCheck(page, `${TEST_AUTH_SERVER}/digest-auth/auth/${testUser}/${testPass}`);

        // Save and test
        await saveAndTest(page);

        // Verify health check success
        const isSuccess = await verifyHealthCheckSuccess(page);
        expect(isSuccess).toBeTruthy();
    });

    test('should fail health check with wrong digest auth password', async ({ createDataSourceConfigPage, page }) => {
        const testUser = 'digestuser';
        const testPass = 'digestpass';
        const wrongPass = 'wrongpassword';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Digest Auth
        await selectAuthMethod(page, 'Digest Auth');

        // Fill in credentials with wrong password
        await fillDigestAuthFields(page, testUser, wrongPass);

        // Add allowed host
        await addAllowedHost(page, TEST_AUTH_SERVER);

        // Enable custom health check (expects correct password)
        await enableCustomHealthCheck(page, `${TEST_AUTH_SERVER}/digest-auth/auth/${testUser}/${testPass}`);

        // Save and test
        await saveAndTest(page);

        // Verify health check failure
        const isFailure = await verifyHealthCheckFailure(page);
        expect(isFailure).toBeTruthy();
    });
});
