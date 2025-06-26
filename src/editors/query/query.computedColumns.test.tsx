import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ComputedColumnsEditor } from './query.computedColumns';
import type { InfinityColumn, InfinityColumnFormat, InfinityQuery, InfinityQueryFormat, InfinityURLOptions } from '../../types';

describe('ComputedColumnsEditor', () => {
  // Freezing the object so that any mutations throw errors
  const mockQuery: InfinityQuery = Object.freeze({
    refId: 'A',
    type: 'json',
    source: 'url',
    url: 'http://example.com',
    parser: 'backend',
    columns: [],
    format: 'table' as InfinityQueryFormat,
    root_selector: '',
    url_options: {} as InfinityURLOptions,
    computed_columns: Object.freeze([
      {
        text: 'Column 1',
        selector: '$.name',
        type: 'string' as InfinityColumnFormat,
      },
      {
        text: 'Column 2',
        selector: '$.value',
        type: 'number' as InfinityColumnFormat,
      },
    ]) as InfinityColumn[],
  });

  const mockOnChange = jest.fn();
  const mockOnRunQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Removing computed columns', () => {
    it('should remove a computed column when clicking the trash button', async () => {
      render(<ComputedColumnsEditor query={mockQuery} onChange={mockOnChange} onRunQuery={mockOnRunQuery} />);

      // Find and click the trash button for the first computed column
      const deleteButtons = screen.getAllByTestId('trash-alt');
      await userEvent.click(deleteButtons[0]);

      // Verify onChange was called with the first computed column removed
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockQuery,
          computed_columns: [
            {
              text: 'Column 2',
              selector: '$.value',
              type: 'number',
            },
          ],
        })
      );
    });

    it('should remove all computed columns when clicking trash buttons on all items', async () => {
      const queryWithSingleColumn: InfinityQuery = Object.freeze({
        ...mockQuery,
        computed_columns: Object.freeze([
          {
            text: 'Single Column',
            selector: '$.single',
            type: 'string' as InfinityColumnFormat,
          },
        ]) as InfinityColumn[],
      });

      render(<ComputedColumnsEditor query={queryWithSingleColumn} onChange={mockOnChange} onRunQuery={mockOnRunQuery} />);

      // Click the trash button to remove the single computed column
      const deleteButton = screen.getByTestId('trash-alt');
      await userEvent.click(deleteButton);

      // Verify onChange was called with empty computed_columns array
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ...queryWithSingleColumn,
          computed_columns: [],
        })
      );
    });
  });
});
