import { login } from './utils/login';
import { checkDropdownValue, changeDropdownValue, checkInputContent, changeInputContent } from './utils/editorFieldCheck';
import { checkExploreTableContent, checkExploreError } from './utils/explore';
import type { InfinityQuery } from '../../src/types/query.types';

const visitExplorePage = (query: Partial<InfinityQuery> = {}) => {
  cy.visit('/explore', { qs: { left: JSON.stringify({ datasource: 'Infinity', queries: [query] }) } });
};

describe('explore', () => {
  it('should able to run JSON queries correctly', () => {
    login();
    visitExplorePage();
    // Default query should work without any error
    checkDropdownValue('Type', 'JSON');
    checkDropdownValue('Parser', 'Default');
    checkDropdownValue('Source', 'URL');
    checkInputContent('URL', 'https://github.com/yesoreyeram/grafana-infinity-datasource/blob/main/testdata/users.json');
    checkDropdownValue('Format', 'Table');
    checkExploreTableContent('Leanne Graham');
    cy.contains(`Parsing options & Result fields`);
    cy.contains(`Computed columns, Filter, Group by`).should('not.exist');
    // JSON query with backend should work
    changeDropdownValue('Parser', 'Backend');
    checkExploreTableContent('Leanne Graham');
    cy.contains(`Parsing options & Result fields`);
    cy.contains(`Computed columns, Filter, Group by`);
    // JSON query with UQL should work
    changeDropdownValue('Parser', 'UQL');
    checkExploreTableContent('Leanne Graham');
    cy.contains(`UQL Query`);
    cy.contains(`Parsing options & Result fields`).should('not.exist');
    cy.contains(`Computed columns, Filter, Group by`).should('not.exist');
    cy.contains(`GROQ Query`).should('not.exist');
    // JSON query with GROQ should work
    changeDropdownValue('Parser', 'GROQ');
    checkExploreTableContent('Leanne Graham');
    cy.contains(`GROQ Query`);
    cy.contains(`Parsing options & Result fields`).should('not.exist');
    cy.contains(`Computed columns, Filter, Group by`).should('not.exist');
    cy.contains(`UQL Query`).should('not.exist');
    // CSV with default parser should work
    changeDropdownValue('Type', 'CSV');
    checkExploreError('Invalid Opening Quote: a quote is found inside a field at line 3');
    changeInputContent('URL', 'https://github.com/yesoreyeram/grafana-infinity-datasource/blob/main/testdata/users.csv');
    changeDropdownValue('Parser', 'Default');
    checkExploreTableContent('Leanne Graham');
  });
});
