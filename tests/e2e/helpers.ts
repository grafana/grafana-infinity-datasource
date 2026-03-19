import { type Page } from '@playwright/test';


/**
 * Verify that a secure field shows "configured" status
 * @param page - Playwright page object
 * @param label - Label of the field to check (e.g., "Password", "Bearer token")
 * @returns Promise<boolean> - True if field shows configured status
 */
export async function verifySecureFieldConfigured(page: Page, label: string): Promise<boolean> {
    const secureFieldLabel = await page.getByTestId(`infinity-config-secure-field-${label}`)
    const configuredInput = await secureFieldLabel.getByText('Reset');
    return await configuredInput.isVisible();
}

/**
 * Reset a secure field value
 * @param page - Playwright page object
 */
export async function resetSecureField(page: Page): Promise<void> {
    const resetButton = page.getByRole('button', { name: 'Reset' });
    await resetButton.click();
}

/**
 * Navigate to the Authentication tab in config editor
 * @param page - Playwright page object
 * @param tabName - Config tab to navigate. Ex: 'Authentication'
 */
export async function navigateToConfigTab(page: Page, tabName: string): Promise<void> {
    await page.getByRole('button', { name: tabName }).first().click();
}


/**
 * Select an authentication method from the auth type grid
 * @param page - Playwright page object
 * @param authLabel - Label of the auth method (e.g., "Basic Authentication", "Bearer Token", "Digest Auth")
 */
export async function selectAuthMethod(page: Page, authLabel: string): Promise<void> {
    await page.getByRole('button', { name: authLabel }).first().click();
}

/**
 * Fill in basic authentication credentials
 * @param page - Playwright page object
 * @param username - Username for basic auth
 * @param password - Password for basic auth
 */
export async function fillBasicAuthFields(page: Page, username: string, password: string): Promise<void> {
    // Fill username field
    const usernameInput = page.getByPlaceholder('username');
    await usernameInput.fill(username);

    // Fill password field
    const passwordInput = page.getByPlaceholder('password').first();
    await passwordInput.fill(password);
}

/**
 * Fill in digest authentication credentials (same fields as basic auth)
 * @param page - Playwright page object
 * @param username - Username for digest auth
 * @param password - Password for digest auth
 */
export async function fillDigestAuthFields(page: Page, username: string, password: string): Promise<void> {
    await fillBasicAuthFields(page, username, password);
}

/**
 * Fill in bearer token field
 * @param page - Playwright page object
 * @param token - Bearer token value
 */
export async function fillBearerTokenField(page: Page, token: string): Promise<void> {
    const tokenInput = page.getByPlaceholder('bearer token');
    await tokenInput.fill(token);
}


/**
 * Add an allowed host to the datasource configuration
 * @param page - Playwright page object
 * @param host - Host URL to allow (e.g., "http://httpbin:8080")
 */
export async function addAllowedHost(page: Page, host: string): Promise<void> {
    // Find the allowed hosts input field and add the host
    const allowedHostsInput = page.locator('input[placeholder*="host"]').first();
    await allowedHostsInput.fill(host);
    await allowedHostsInput.press('Enter');
}

/**
 * Enable custom health check and set the URL
 * @param page - Playwright page object
 * @param url - Health check URL
 */
export async function enableCustomHealthCheck(page: Page, url: string): Promise<void> {
    // Navigate to Health Check tab
    await page.getByRole('button', { name: 'Health Check' }).click();

    // Enable custom health check - click the wrapper label to toggle
    const wrapper = page.getByTestId('enable_custom_healthcheck_wrapper');
    const switchLabel = wrapper.locator('label').last();
    const enableSwitch = page.getByTestId('enable_custom_healthcheck_switch');
    const isChecked = await enableSwitch.isChecked();
    if (!isChecked) {
        await switchLabel.click();
    }
    await page.waitForTimeout(300);

    // Fill in health check URL
    const healthCheckUrlInput = page.getByPlaceholder('https://jsonplaceholder.typicode.com/users');
    await healthCheckUrlInput.fill(url);
}

/**
 * Click the "Save & Test" button and wait for health check result
 * @param page - Playwright page object
 */
export async function saveAndTest(page: Page): Promise<void> {
    const saveButton = page.getByRole('button', { name: 'Save & test' });
    await saveButton.click();
    // Wait a moment for the health check to complete
    await page.waitForTimeout(2000);
}

/**
 * Verify health check success message is displayed
 * @param page - Playwright page object
 * @returns Promise<boolean> - True if success message found
 */
export async function verifyHealthCheckSuccess(page: Page): Promise<boolean> {
    const healthCheckResultContainer = await page.getByRole('status');
    const element = await healthCheckResultContainer.getByText('Health check successful', { exact: true });
    return element.isVisible()
}

/**
 * Verify health check failure message is displayed
 * @param page - Playwright page object
 * @param message - optional : Message to verify
 * @returns Promise<boolean> - True if failure message found
 */
export async function verifyHealthCheckFailure(page: Page, message?: string): Promise<boolean> {
    if (message) {
        const healthCheckResultContainer = await page.getByRole('status');
        const element = healthCheckResultContainer.getByText(message, { exact: false });
        return element.isVisible()
    }
    // Look for failure indicators
    const failureMessages = [
        'Health check failed',
        'error',
        'Error',
        'failed',
        '401',
        '403',
        'Unauthorized',
    ];

    for (const message of failureMessages) {
        const element = page.getByText(message, { exact: false });
        if (await element.isVisible().catch(() => false)) {
            return true;
        }
    }

    return false;
}
