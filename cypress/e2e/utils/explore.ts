export const runExploreQuery = (wait = 1 * 1000) => {
  cy.get(`[data-testid="data-testid RefreshPicker run button"]`).focus().click();
  cy.wait(wait);
};

export const checkExploreTableContent = (check: string = '', wait = 1 * 1000) => {
  runExploreQuery();
  cy.contains('Query error').should('not.exist');
  cy.get(`[aria-label="Explore Table"]`).contains(check);
  cy.wait(wait);
};

export const checkExploreError = (check = '', wait = 1 * 1000) => {
  runExploreQuery();
  cy.contains('Query error');
  if (check) {
    cy.contains(check);
  }
  cy.wait(wait);
};
