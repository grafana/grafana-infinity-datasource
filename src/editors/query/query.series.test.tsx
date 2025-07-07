import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SeriesAdvancedOptions, SeriesEditor } from './query.series';
import type { DataOverride, InfinitySeriesQuery } from '../../types';

describe('SeriesEditor', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add alias: Random Walk as default to query without mutating query', async () => {
    const emptyQuery: InfinitySeriesQuery = Object.freeze({ type: 'series' } as InfinitySeriesQuery);

    expect(async () => {
      render(<SeriesEditor query={emptyQuery} onChange={mockOnChange} />);
      await waitFor(() => {
        expect(screen.getByLabelText('Series Count')).toBeInTheDocument();
      });
    }).not.toThrow();
    expect(emptyQuery.dataOverrides).toBeUndefined();
    expect(mockOnChange).not.toHaveBeenCalled();

    // lets check that the query object has the alias: 'Random Walk'
    await userEvent.type(screen.getByRole('spinbutton'), '2');
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ alias: 'Random Walk', seriesCount: 2, type: 'series' }));
  });
});

describe('SeriesAdvancedOptions', () => {
  // Freezing the object so that any mutations throw errors
  const mockQuery: InfinitySeriesQuery = Object.freeze({
    refId: 'A',
    type: 'series',
    source: 'random-walk',
    seriesCount: 1,
    alias: 'Test Series',
    dataOverrides: Object.freeze([]) as unknown as DataOverride[],
  });

  const mockOnChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Adding data overrides', () => {
    it('should add data overrides as defaults to query without mutating query', async () => {
      const emptyQuery: InfinitySeriesQuery = Object.freeze({ type: 'series' } as InfinitySeriesQuery);

      expect(() => render(<SeriesAdvancedOptions query={emptyQuery} onChange={mockOnChange} />)).not.toThrow();
      expect(emptyQuery.dataOverrides).toBeUndefined();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should add a new data override when clicking "Click to add Overrides"', async () => {
      render(<SeriesAdvancedOptions query={mockQuery} onChange={mockOnChange} />);

      // Open the modal
      const advancedButton = screen.getByText('Advanced Options');
      await userEvent.click(advancedButton);

      // Click to add override
      const addOverrideButton = screen.getByText('Click to add Overrides');
      await userEvent.click(addOverrideButton);

      // Verify onChange was called with the new data override
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockQuery,
          dataOverrides: [
            {
              values: ['${__value.index}', '10'],
              operator: '>=',
              override: 'null',
            },
          ],
        })
      );
    });

    it('should add a new data override when clicking the "+" button', async () => {
      const queryWithExistingOverride: InfinitySeriesQuery = Object.freeze({
        ...mockQuery,
        dataOverrides: Object.freeze([
          {
            values: ['test1', 'test2'],
            operator: '=',
            override: 'test-override',
          },
        ]) as unknown as DataOverride[],
      });

      render(<SeriesAdvancedOptions query={queryWithExistingOverride} onChange={mockOnChange} />);

      // Open the modal
      const advancedButton = screen.getByText('Advanced Options');
      await userEvent.click(advancedButton);

      // Click the "+" button to add another override
      const addButton = screen.getByText('+');
      await userEvent.click(addButton);

      // Verify onChange was called with the additional data override
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ...queryWithExistingOverride,
          dataOverrides: [
            {
              values: ['test1', 'test2'],
              operator: '=',
              override: 'test-override',
            },
            {
              values: ['${__value.index}', '10'],
              operator: '>=',
              override: 'null',
            },
          ],
        })
      );
    });
  });

  describe('Deleting data overrides', () => {
    it('should remove a data override when clicking the "X" button', async () => {
      // Freezing the object so that any mutations throw errors
      const queryWithOverrides: InfinitySeriesQuery = Object.freeze({
        ...mockQuery,
        dataOverrides: Object.freeze([
          {
            values: ['test1', 'test2'],
            operator: '=',
            override: 'test-override',
          },
          {
            values: ['test3', 'test4'],
            operator: '!=',
            override: 'another-override',
          },
        ]) as unknown as DataOverride[],
      });

      render(<SeriesAdvancedOptions query={queryWithOverrides} onChange={mockOnChange} />);

      // Open the modal
      const advancedButton = screen.getByText('Advanced Options');
      await userEvent.click(advancedButton);

      // Find and click the "X" button for the first override
      const deleteButtons = screen.getAllByText('X');
      await userEvent.click(deleteButtons[0]);

      // Verify onChange was called with the first override removed
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ...queryWithOverrides,
          dataOverrides: [
            {
              values: ['test3', 'test4'],
              operator: '!=',
              override: 'another-override',
            },
          ],
        })
      );
    });

    it('should remove all data overrides when clicking "X" on all items', async () => {
      // Freezing the object so that any mutations throw errors
      const queryWithOverrides: InfinitySeriesQuery = Object.freeze({
        ...mockQuery,
        dataOverrides: Object.freeze([
          {
            values: ['test1', 'test2'],
            operator: '=',
            override: 'test-override',
          },
        ]) as unknown as DataOverride[],
      });

      render(<SeriesAdvancedOptions query={queryWithOverrides} onChange={mockOnChange} />);

      // Open the modal
      const advancedButton = screen.getByText('Advanced Options');
      await userEvent.click(advancedButton);

      // Click the "X" button to remove the override
      const deleteButton = screen.getByText('X');
      await userEvent.click(deleteButton);

      // Verify onChange was called with empty dataOverrides array
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ...queryWithOverrides,
          dataOverrides: [],
        })
      );
    });
  });
});
