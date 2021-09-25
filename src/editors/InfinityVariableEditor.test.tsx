import React from 'react';
import { render } from '@testing-library/react';
import { InfinityDatasource } from './../datasource';
import { InfinityVariableEditor } from './InfinityVariableEditor';
import { InfinityVariableQuery } from './../types';

describe('InfinityVariableEditor', () => {
  it('should render correctly', () => {
    const datasource = {} as InfinityDatasource;
    const query = {} as InfinityVariableQuery;
    const onChange = jest.fn();
    const result = render(<InfinityVariableEditor datasource={datasource} query={query} onChange={onChange} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
