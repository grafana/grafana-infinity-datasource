import { login } from './utils/login';
import { checkDropdownValue } from './utils/editorFieldCheck';
import { checkExploreTableContent, runExploreQuery } from './utils/explore';
import type { InfinityQuery } from '../../src/types/query.types';

const visitExplorePage = (query: Partial<InfinityQuery> = {}) => {
  cy.visit('/explore', { qs: { left: JSON.stringify({ datasource: 'Infinity', queries: [query] }) } });
};

describe('explore', () => {
  beforeEach(() => {
    cy.viewport(1792, 1017);
    login();
  });
  it.skip('should able to run UQL queries correctly', () => {
    visitExplorePage({ type: 'uql', source: 'inline', data: `a,b,c\n1,2,3\n4,5,6`, uql: `parse-csv | summarize count() | project "count"` });
    checkDropdownValue('Type', 'UQL');
    checkDropdownValue('Source', 'Inline');
    runExploreQuery();
    checkExploreTableContent(`result2`);
    visitExplorePage({ type: 'uql', source: 'inline', data: `a,b,c\n1,2,3\n4,5,6`, uql: `parse-csv | summarize "mean"=mean("b") | project "mean"` });
    checkDropdownValue('Type', 'UQL');
    checkDropdownValue('Source', 'Inline');
    runExploreQuery();
    checkExploreTableContent(`result12.5`);
  });
});
