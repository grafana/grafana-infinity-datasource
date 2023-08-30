import { login } from './utils/login';
import { checkDropdownValue, checkInputContent } from './utils/editorFieldCheck';
import { checkExploreTableContent, runExploreQuery } from './utils/explore';
import type { InfinityQuery } from './../../src/types/query.types';

const visitExplorePage = (query: Partial<InfinityQuery> = {}) => {
  cy.visit('/explore', { qs: { left: JSON.stringify({ datasource: 'Infinity', queries: [query] }) } });
};

describe('explore', () => {
  it.skip('should able to run default queries correctly', () => {
    login();
    visitExplorePage();
    checkDropdownValue('Type', 'JSON');
    checkDropdownValue('Parser', 'Default');
    checkDropdownValue('Source', 'URL');
    checkInputContent('URL', 'https://github.com/yesoreyeram/grafana-infinity-datasource/blob/main/testdata/users.json');
    checkDropdownValue('Format', 'Table');
    runExploreQuery();
    checkExploreTableContent(['age', 'country', 'name', 'occupation', 'salary', '38', 'USA', 'Leanne Graham', 'Devops Engineer', '3000'].join(''));
  });
});
