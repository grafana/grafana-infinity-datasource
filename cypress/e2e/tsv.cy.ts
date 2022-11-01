import { login } from './utils/login';
import { checkDropdownValue, changeDropdownValue, checkInputContent } from './utils/editorFieldCheck';
import { runExploreQuery, checkExploreTableContent } from './utils/explore';
import type { InfinityQuery } from '../../src/types/query.types';

const visitExplorePage = (query: Partial<InfinityQuery> = {}) => {
  cy.visit('/explore', { qs: { left: JSON.stringify({ datasource: 'Infinity', queries: [query] }) } });
};

describe('explore', () => {
  it('should able to run TSV queries correctly', () => {
    login();
    visitExplorePage({ type: 'tsv', url: 'https://github.com/yesoreyeram/grafana-infinity-datasource/blob/main/testdata/users.tsv' });

    checkDropdownValue('Type', 'TSV');
    checkDropdownValue('Parser', 'Default');
    checkDropdownValue('Source', 'URL');
    checkInputContent('URL', 'https://github.com/yesoreyeram/grafana-infinity-datasource/blob/main/testdata/users.tsv');
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
  });
});
