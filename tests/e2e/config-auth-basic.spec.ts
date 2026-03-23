import { test, expect } from '@grafana/plugin-e2e';
import {
    selectAuthMethod,
    fillBasicAuthFields,
    addAllowedHost,
    enableCustomHealthCheck,
    saveAndTest,
    verifyHealthCheckSuccess,
    verifyHealthCheckFailure,
    navigateToConfigTab,
} from './helpers';
import { testAuthServerUrl } from '../../playwright.config';


test.describe('Config Editor - Basic Authentication @auth @auth-basic', () => {
    test('should pass health check with valid basic auth credentials', async ({ createDataSourceConfigPage, page }) => {
        const testUser = 'testuser';
        const testPass = 'testpass';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Basic Authentication
        await selectAuthMethod(page, 'Basic Authentication');

        // Fill in credentials
        await fillBasicAuthFields(page, testUser, testPass);

        // Add allowed host
        await addAllowedHost(page, testAuthServerUrl);

        // Enable custom health check with valid endpoint
        await enableCustomHealthCheck(page, `${testAuthServerUrl}/basic-auth/${testUser}/${testPass}`);

        // Save and test
        await saveAndTest(page);

        // Verify health check success
        const isSuccess = await verifyHealthCheckSuccess(page);
        expect(isSuccess).toBeTruthy();
    });

    test('should fail health check with invalid basic auth credentials', async ({ createDataSourceConfigPage, page }) => {
        const testUser = 'testuser';
        const testPass = 'testpass';
        const wrongUser = 'wronguser';
        const wrongPass = 'wrongpass';

        // Create datasource and navigate to config
        await createDataSourceConfigPage({ type: 'yesoreyeram-infinity-datasource' });

        // Navigate to Authentication tab
        await navigateToConfigTab(page, 'Authentication');

        // Select Basic Authentication
        await selectAuthMethod(page, 'Basic Authentication');

        // Fill in wrong credentials
        await fillBasicAuthFields(page, wrongUser, wrongPass);

        // Add allowed host
        await addAllowedHost(page, testAuthServerUrl);

        // Enable custom health check (endpoint expects testuser/testpass, but we configured wronguser/wrongpass)
        await enableCustomHealthCheck(page, `${testAuthServerUrl}/basic-auth/${testUser}/${testPass}`);

        // Save and test
        await saveAndTest(page);

        // Verify health check failure
        const isFailure = await verifyHealthCheckFailure(page);
        expect(isFailure).toBeTruthy();
    });
});
