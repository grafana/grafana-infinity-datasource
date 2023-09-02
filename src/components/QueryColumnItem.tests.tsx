import { render } from '@testing-library/react';
import React from 'react';
import { QueryColumnItem } from './QueryColumnItem';
import type { InfinityQuery } from './../types';

describe('app/components/QueryColumnItem', () => {
  it('should render without error', () => {
    const query = { type: 'json', columns: [{}] } as InfinityQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<QueryColumnItem query={query} onChange={onChange} onRunQuery={onRunQuery} index={0} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
