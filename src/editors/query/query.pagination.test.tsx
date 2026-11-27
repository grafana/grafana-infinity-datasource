import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { PaginationEditor } from '@/editors/query/query.pagination';
import type { InfinityQuery } from '@/types';

describe('PaginationEditor', () => {
  const onChange = jest.fn();
  const query = { refId: 'A', type: 'json', source: 'url', pagination_mode: 'page', pagination_param_page_value: 1 } as InfinityQuery;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderEditor = () => {
    render(<PaginationEditor query={query} onChange={onChange} onRunQuery={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Pagination' }));
  };

  const getPageValueInput = () => screen.getAllByRole('spinbutton').find((el) => (el as HTMLInputElement).value === '1') as HTMLInputElement;

  it('should keep 0 as the initial page number for zero indexed APIs', () => {
    renderEditor();
    fireEvent.change(getPageValueInput(), { target: { value: '0' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ pagination_param_page_value: 0 }));
  });

  it('should fall back to page 1 when the initial page number is cleared', () => {
    renderEditor();
    fireEvent.change(getPageValueInput(), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ pagination_param_page_value: 1 }));
  });
});
