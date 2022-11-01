const timeout = 30 * 1000;
export const login = () => {
  cy.viewport(1792, 1017);
  cy.visit('/login', { timeout });
  cy.contains('Welcome to Grafana', { timeout });
  cy.get(`[aria-label="${'Username input field'}"]`, { timeout }).should('be.visible').type('infinity');
  cy.get(`[aria-label="${'Password input field'}"]`, { timeout }).should('be.visible').type('infinity');
  cy.get(`[aria-label="${'Login button'}"]`, { timeout }).click();
  cy.get('.login-page', { timeout }).should('not.exist');
};
