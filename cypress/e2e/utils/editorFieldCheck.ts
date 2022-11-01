export const checkDropdownValue = (fieldName: string, text: string, timeout = 30 * 1000, wait = 0) => {
  cy.get(`[data-testid="infinity-query-field-wrapper-${fieldName.replace(/\ /g, '-').toLowerCase()}"]`).within(($el) => {
    cy.contains(text, { timeout });
  });
  cy.wait(wait);
};

export const changeDropdownValue = (fieldName: string, text: string, timeout = 30 * 1000, wait = 0) => {
  if (fieldName === 'Parser' && text === 'Backend') {
    cy.wait(1 * 1000);
  }
  cy.get(`[data-testid="infinity-query-field-wrapper-${fieldName.replace(/\ /g, '-').toLowerCase()}"]`).within(($el) => {
    cy.get('[class$="-input-suffix"]').click();
    cy.get('input').type(`${text}{enter}`);
  });
  cy.wait(wait);
  cy.contains(text);
};

export const checkInputContent = (fieldName: string, text: string, timeout = 30 * 1000, wait = 0) => {
  cy.get(`[data-testid="infinity-query-field-wrapper-${fieldName.replace(/\ /g, '-').toLowerCase()}"] input`).should('have.value', text);
  cy.wait(wait);
};

export const changeInputContent = (fieldName: string, text: string, timeout = 30 * 1000, wait = 0) => {
  cy.get(`[data-testid="infinity-query-field-wrapper-${fieldName.replace(/\ /g, '-').toLowerCase()}"] input`)
    .clear()
    .type(Cypress.platform === 'darwin' ? `{cmd+a}{del}${text}` : `{ctrl+a}{del}${text}`);
  cy.wait(wait);
};
