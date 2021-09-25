import React from 'react';
import { render } from '@testing-library/react';
import { InfinityDatasource } from './../datasource';
import { InfinityQueryEditor } from './InfinityQueryEditor';
import { InfinityQuery } from './../types';

describe('InfinityQueryEditor', () => {
  it('should render correctly', () => {
    const datasource = {} as InfinityDatasource;
    const query = {} as InfinityQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<InfinityQueryEditor datasource={datasource} query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
