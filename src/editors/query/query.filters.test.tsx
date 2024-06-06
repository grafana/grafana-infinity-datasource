import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { TableFilter } from './query.filters';

// We need to freeze the object to test for mutations
describe('TableFilter', () => {
  it('should render correct number of filters', () => {
    const query: any = Object.freeze({ columns: [{ text: 'name' }], filters: [{ field: 'name', operator: '', value: [''] }], type: 'csv' });
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<TableFilter query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    fireEvent.click(screen.getByTestId('infinity-query-row-collapse-show-results-filter'));
    expect(screen.getByText(/Filter 1/)).toBeInTheDocument();
  });

  it('should add filter correctly', () => {
    const query: any = Object.freeze({ columns: [], filters: [], type: 'csv' });
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<TableFilter query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    fireEvent.click(screen.getByTestId('infinity-query-row-collapse-show-results-filter'));
    fireEvent.click(screen.getByText(/Add filter/));
    expect(onChange).toHaveBeenCalledWith({ ...query, filters: [{ field: '', operator: 'equals', value: [''] }] });
  });

  it('should remove filter correctly', () => {
    const query: any = Object.freeze({ columns: [], filters: [{ field: '', operator: '', value: [''] }], type: 'csv' });
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<TableFilter query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    fireEvent.click(screen.getByTestId('infinity-query-row-collapse-show-results-filter'));
    fireEvent.click(screen.getByTestId(/trash-alt/));
    expect(onChange).toHaveBeenCalledWith({ ...query, filters: [] });
  });

  it('should handle value change', () => {
    const query: any = Object.freeze({ columns: [], filters: [{ field: '', operator: '', value: [''] }], type: 'csv' });
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<TableFilter query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    fireEvent.click(screen.getByTestId('infinity-query-row-collapse-show-results-filter'));
    fireEvent.change(screen.getByPlaceholderText(/Value/), { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith({ ...query, filters: [{ field: '', operator: '', value: ['test'] }] });
  });
});
