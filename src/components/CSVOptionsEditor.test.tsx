import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CSVOptionsEditor } from './CSVOptionsEditor';
import { InfinityQuery } from 'types';

describe('components', () => {
  describe('CSVOptionsEditor', () => {
    it('should render nothing if type is not csv/tsx', () => {
      const query: InfinityQuery = { type: 'xml' } as InfinityQuery;
      const onChange = jest.fn();
      const onRunQuery = jest.fn();
      const result = render(<CSVOptionsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
      expect(result.container.firstChild).toBeNull();
      expect(result.queryByText('CSV options')).not.toBeInTheDocument();
      expect(result.queryByText('Skip empty lines')).not.toBeInTheDocument();
    });
    it('should render without error', () => {
      const query: InfinityQuery = { type: 'csv' } as InfinityQuery;
      const onChange = jest.fn();
      const onRunQuery = jest.fn();
      const result = render(<CSVOptionsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
      expect(result.container.firstChild).not.toBeNull();
      expect(result.getByText('CSV options')).toBeInTheDocument();
      expect(result.queryByText('Skip empty lines')).not.toBeInTheDocument();
    });
    it('should trigger events with correct parameters', () => {
      const query: InfinityQuery = { type: 'csv' } as InfinityQuery;
      const onChange = jest.fn();
      const onRunQuery = jest.fn();
      const result = render(<CSVOptionsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />);
      expect(result.container.firstChild).not.toBeNull();
      expect(result.getByText('CSV options')).toBeInTheDocument();
      expect(result.queryByText('Skip empty lines')).not.toBeInTheDocument();
      userEvent.click(result.getByText('CSV options'));
      expect(result.getByText('Skip empty lines')).toBeInTheDocument();
      expect(result.getByTestId('skip_empty_lines')).not.toBeChecked();
      userEvent.click(result.getByTestId('skip_empty_lines'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenNthCalledWith(1, { ...query, csv_options: { skip_empty_lines: true } });
      expect(result.getByTestId('skip_empty_lines')).toBeChecked();
      userEvent.click(result.getByTestId('skip_empty_lines'));
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenNthCalledWith(2, { ...query, csv_options: { skip_empty_lines: false } });
      expect(result.getByTestId('skip_empty_lines')).not.toBeChecked();
    });
  });
});
