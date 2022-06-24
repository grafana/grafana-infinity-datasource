import { render } from '@testing-library/react';
import React from 'react';
import { InfinityHelp } from './Help';

describe('app/components/Help', () => {
  it('should render without error', () => {
    const result = render(<InfinityHelp />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
