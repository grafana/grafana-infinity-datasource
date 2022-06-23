import { selectors } from '@grafana/e2e-selectors';

const baseurl = 'http://localhost:3000';

describe('UQL', () => {
  it('should able to run UQL queries correctly', () => {
    cy.viewport(1792, 1017);
    cy.visit(baseurl + '/login');
    cy.get(`input[aria-label='${selectors.pages.Login.username}']`).should('be.visible').type('admin');
    cy.get(`input[aria-label='${selectors.pages.Login.password}']`).should('be.visible').type('admin');
    cy.get(`button[aria-label='${selectors.pages.Login.submit}']`).should('be.visible').click();
    cy.get(`button[aria-label='${selectors.pages.Login.skip}']`).should('be.visible').click();
    cy.get('body.login-page').should('not.exist');
    cy.get(`nav a[aria-label="Explore"]`).should('be.visible').click();
    cy.get(`input[aria-label="Select a data source"]`).should('be.visible').type('Infinity{enter}');
    cy.get(`[data-testid="infinity-query-type-selector"] input`).should('be.visible');
    /// UQL Inline query - with string array
    cy.get(`[data-testid="infinity-query-type-selector"] input`).type('{selectall}{del}UQL{enter}');
    cy.get(`[data-testid="infinity-query-source-selector"] input`).type('{selectall}{del}Inline{enter}');
    cy.get(`[data-testid="infinity-query-inline-data-selector"]`).should('be.visible').type(`{selectall}{del}["foo","bar"]{cmd+s}`);
    cy.get(`button[aria-label='Run query']`).should('be.visible').click();
    cy.get(`[data-testid="infinity-query-uql-selector"]`).should('be.visible').type(`{selectall}{del}parse-json{cmd+s}`);
    cy.get(`button[aria-label='Run query']`).should('be.visible').click();
    cy.get(`div[aria-label='${selectors.pages.Explore.General.table}']`).should(($p) => expect($p).to.contain(`resultfoobar`));
    /// UQL Inline query - with numeric array
    cy.get(`[data-testid="infinity-query-type-selector"] input`).type('{selectall}{del}UQL{enter}');
    cy.get(`[data-testid="infinity-query-source-selector"] input`).type('{selectall}{del}Inline{enter}');
    cy.get(`[data-testid="infinity-query-inline-data-selector"]`).should('be.visible').type(`{selectall}{del}[1,5,10]{cmd+s}`);
    cy.get(`button[aria-label='Run query']`).should('be.visible').click();
    cy.get(`[data-testid="infinity-query-uql-selector"]`).should('be.visible').type(`{selectall}{del}parse-json | limit 2{cmd+s}`);
    cy.get(`button[aria-label='Run query']`).should('be.visible').click();
    cy.get(`div[aria-label='${selectors.pages.Explore.General.table}']`).should(($p) => expect($p).to.contain(`result15`));
    /// UQL URL query - with url with query params
    cy.get(`[data-testid="infinity-query-type-selector"] input`).type('{selectall}{del}UQL{enter}');
    cy.get(`[data-testid="infinity-query-source-selector"] input`).type('{selectall}{del}URL{enter}');
    cy.get(`[data-testid="infinity-query-url-input"]`).should('be.visible').type(`{selectall}{del}http://httpbin/get?foo=bar&foo=baz&jack=jill{cmd+s}`);
    cy.get(`button[aria-label='Run query']`).should('be.visible').click();
    cy.get(`[data-testid="infinity-query-uql-selector"]`).should('be.visible').type(`{selectall}{del}parse-json | scope "args" | project kv(){cmd+s}`);
    cy.get(`button[aria-label='Run query']`).should('be.visible').click();
    cy.get(`div[aria-label='${selectors.pages.Explore.General.table}']`).should(($p) => expect($p).to.contain(`keyvalue` + `foo["bar","baz"]` + `jack"jill"`));
    /// UQL URL query - with url with headers
    cy.get(`[data-testid="infinity-query-type-selector"] input`).type('{selectall}{del}UQL{enter}');
    cy.get(`[data-testid="infinity-query-source-selector"] input`).type('{selectall}{del}URL{enter}');
    cy.get(`[data-testid="infinity-query-url-input"]`).should('be.visible').type(`{selectall}{del}http://httpbin/get{cmd+s}`);
    cy.get(`button[aria-label='Run query']`).should('be.visible').click();
    cy.get(`[data-testid="infinity-query-uql-selector"]`).should('be.visible').type(`{selectall}{del}parse-json | scope "headers" | project kv(){cmd+s}`);
    cy.get(`button[aria-label='Run query']`).should('be.visible').click();
    cy.get(`div[aria-label='${selectors.pages.Explore.General.table}']`).should(($p) => expect($p).to.contain(`keyvalue` + `Accept-Encodinggzip` + `Hosthttpbin` + `User-AgentGo-http-client/1.1`));
  });
});
