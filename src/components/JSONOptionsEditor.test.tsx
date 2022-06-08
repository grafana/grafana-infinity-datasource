import { vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { JSONOptionsEditor } from './JSONOptionsEditor';
import { InfinityQuery } from '../types';

describe('app/components/JSONOptionsEditor', () => {
  it('should render without error', () => {
    const query = { type: 'json' } as InfinityQuery;
    const onChange = vi.fn();
    const onRunQuery = vi.fn();
    const result = render(<JSONOptionsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
