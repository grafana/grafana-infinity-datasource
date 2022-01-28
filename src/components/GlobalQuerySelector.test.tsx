import React from 'react';
import { render } from '@testing-library/react';
import { GlobalQuerySelector } from './GlobalQuerySelector';
import { InfinityQuery } from './../types';

describe('app/components/GlobalQuerySelector', () => {
  it('should render without error', () => {
    const query = { type: 'global' } as InfinityQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<GlobalQuerySelector query={query} onChange={onChange} onRunQuery={onRunQuery} instanceSettings={{}} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
