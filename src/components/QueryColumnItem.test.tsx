import React from 'react';
import { render } from '@testing-library/react';
import { QueryColumnItem } from './QueryColumnItem';
import { InfinityQuery } from '../types';

describe('app/components/QueryColumnItem', () => {
  it('should render without error', () => {
    const query = { type: 'json', columns: [{}] } as InfinityQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<QueryColumnItem query={query} onChange={onChange} onRunQuery={onRunQuery} mode="standard" index={0} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
