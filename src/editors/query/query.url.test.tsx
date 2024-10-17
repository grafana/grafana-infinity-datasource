import React from 'react';
import { URL } from './query.url';
import { screen, render } from '@testing-library/react';
import { InfinityQueryType, InfinityQueryWithURLSource } from 'types';

describe('URL', () => {
  it('should show changed URL', () => {
    const mockQuery1 = {
      url: 'https://example1.com',
      type: 'json',
      source: 'url',
    } as InfinityQueryWithURLSource<InfinityQueryType>;

    const props = {
      query: mockQuery1,
      onChange: jest.fn(),
      onRunQuery: jest.fn(),
      onShowUrlOptions: jest.fn(),
    };

    const { rerender } = render(<URL {...props} />);
    expect(screen.getByDisplayValue('https://example1.com')).toBeInTheDocument();

    const mockQuery2 = {
      url: 'https://example2.com',
      type: 'json',
      source: 'url',
    } as InfinityQueryWithURLSource<InfinityQueryType>;

    rerender(<URL {...props} query={mockQuery2} />);
    expect(screen.getByDisplayValue('https://example2.com')).toBeInTheDocument();
  });
});
