import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ComputedColumn } from './ComputedColumn';
import type { InfinityColumn, InfinityColumnFormat, InfinityQuery, InfinityQueryFormat, InfinityURLOptions } from '../types';

describe('ComputedColumn', () => {
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
      Object.freeze({
        text: 'Column 1',
        selector: '$.name',
        type: 'string' as InfinityColumnFormat,
      }),
      Object.freeze({
        text: 'Column 2',
        selector: '$.value',
        type: 'number' as InfinityColumnFormat,
      }),
    ]) as InfinityColumn[],
  });

  const mockOnChange = jest.fn();
  const mockOnRunQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onExpressionChange', () => {
    it('should update the selector and call onChange and onRunQuery when expression input loses focus', async () => {
      render(<ComputedColumn query={mockQuery} onChange={mockOnChange} onRunQuery={mockOnRunQuery} index={0} />);

      const expressionInput = screen.getByPlaceholderText('Expression');
      await userEvent.clear(expressionInput);
      await userEvent.type(expressionInput, '$.newSelector');
      await userEvent.tab(); // Trigger onBlur

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockQuery,
        computed_columns: [
          {
            text: 'Column 1',
            selector: '$.newSelector',
            type: 'string',
          },
          {
            text: 'Column 2',
            selector: '$.value',
            type: 'number',
          },
        ],
      });
      expect(mockOnRunQuery).toHaveBeenCalled();
    });

    it('should update the correct computed column based on index', async () => {
      render(<ComputedColumn query={mockQuery} onChange={mockOnChange} onRunQuery={mockOnRunQuery} index={1} />);

      const expressionInput = screen.getByPlaceholderText('Expression');
      await userEvent.clear(expressionInput);
      await userEvent.type(expressionInput, '$.updatedValue');
      await userEvent.tab(); // Trigger onBlur

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockQuery,
        computed_columns: [
          {
            text: 'Column 1',
            selector: '$.name',
            type: 'string',
          },
          {
            text: 'Column 2',
            selector: '$.updatedValue',
            type: 'number',
          },
        ],
      });
      expect(mockOnRunQuery).toHaveBeenCalled();
    });
  });

  describe('onAliasChange', () => {
    it('should update the text and call onChange and onRunQuery when alias input loses focus', async () => {
      render(<ComputedColumn query={mockQuery} onChange={mockOnChange} onRunQuery={mockOnRunQuery} index={0} />);

      const aliasInput = screen.getByPlaceholderText('Title');
      await userEvent.clear(aliasInput);
      await userEvent.type(aliasInput, 'New Column Name');
      await userEvent.tab(); // Trigger onBlur

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockQuery,
        computed_columns: [
          {
            text: 'New Column Name',
            selector: '$.name',
            type: 'string',
          },
          {
            text: 'Column 2',
            selector: '$.value',
            type: 'number',
          },
        ],
      });
      expect(mockOnRunQuery).toHaveBeenCalled();
    });

    it('should update the correct computed column alias based on index', async () => {
      render(<ComputedColumn query={mockQuery} onChange={mockOnChange} onRunQuery={mockOnRunQuery} index={1} />);

      const aliasInput = screen.getByPlaceholderText('Title');
      await userEvent.clear(aliasInput);
      await userEvent.type(aliasInput, 'Updated Value Column');
      await userEvent.tab(); // Trigger onBlur

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockQuery,
        computed_columns: [
          {
            text: 'Column 1',
            selector: '$.name',
            type: 'string',
          },
          {
            text: 'Updated Value Column',
            selector: '$.value',
            type: 'number',
          },
        ],
      });
      expect(mockOnRunQuery).toHaveBeenCalled();
    });
  });
});
