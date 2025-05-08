import { render } from '@testing-library/react';
import React from 'react';
import { SourceSelector } from '@/components/SourceSelector';
import type { InfinityQuery } from '@/types';

describe('app/components/SourceSelector', () => {
  it('should render without error', () => {
    const query = {} as InfinityQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(<SourceSelector query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
