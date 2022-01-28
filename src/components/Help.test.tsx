import React from 'react';
import { render } from '@testing-library/react';
import { Help } from './Help';

describe('app/components/Help', () => {
  it('should render without error', () => {
    const result = render(<Help />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
