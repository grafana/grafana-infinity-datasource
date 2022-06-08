import { vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { SourceSelector } from './SourceSelector';
import { InfinityQuery } from '../types';

describe('app/components/SourceSelector', () => {
  it('should render without error', () => {
    const query = {} as InfinityQuery;
    const onChange = vi.fn();
    const onRunQuery = vi.fn();
    const result = render(<SourceSelector query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
