import { login } from './utils/login';
import { checkDropdownValue, changeDropdownValue, checkInputContent } from './utils/editorFieldCheck';
import { checkExploreTableContent, runExploreQuery } from './utils/explore';
import type { InfinityQuery } from '../../src/types/query.types';

const visitExplorePage = (query: Partial<InfinityQuery> = {}) => {
  cy.visit('/explore', { qs: { left: JSON.stringify({ datasource: 'Infinity', queries: [query] }) } });
};

describe('explore', () => {
  it.skip('should able to run CSV queries correctly', () => {
    login();
    visitExplorePage({ type: 'csv', url: 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.csv' });

    checkDropdownValue('Type', 'CSV');
    checkDropdownValue('Parser', 'Default');
    checkDropdownValue('Source', 'URL');
    checkInputContent('URL', 'https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.csv');
    checkDropdownValue('Format', 'Table');
    runExploreQuery();
    checkExploreTableContent(['Leanne Graham'].join(''));
    cy.contains(`Parsing options & Result fields`);
    cy.contains(`Computed columns, Filter, Group by`).should('not.exist');
    cy.contains(`UQL Query`).should('not.exist');
    cy.contains(`GROQ Query`).should('not.exist');

    changeDropdownValue('Parser', 'Backend');
    checkExploreTableContent(['Leanne Graham'].join(''));
    cy.contains(`Parsing options & Result fields`);
    cy.contains(`Computed columns, Filter, Group by`);
    cy.contains(`UQL Query`).should('not.exist');
    cy.contains(`GROQ Query`).should('not.exist');

    changeDropdownValue('Parser', 'UQL');
    checkExploreTableContent(['Leanne Graham'].join(''));
    cy.contains(`Parsing options & Result fields`).should('not.exist');
    cy.contains(`Computed columns, Filter, Group by`).should('not.exist');
    cy.contains(`UQL`);
    cy.contains(`GROQ Query`).should('not.exist');
  });
});
