import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { FieldType, type DataFrame } from '@grafana/data';
import { of } from 'rxjs';
import { VariableEditor } from '@/editors/variable.editor';
import type { Datasource } from '@/datasource';
import type { VariableQuery } from '@/types';

// Mock react-router-dom Link component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

// Mock @grafana/ui Link component to avoid Router context issues
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe('VariableEditor', () => {
  const query: VariableQuery = {
    refId: 'A',
    queryType: 'infinity',
    infinityQuery: {
      refId: 'A',
      type: 'json',
      source: 'inline',
      parser: 'backend',
      data: '{}',
      root_selector: '',
      columns: [{ text: '', selector: '', type: 'string' }],
      filters: [],
      format: 'table',
    },
  } as VariableQuery;

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not crash the field mapping editor when the query returns a field without a name', async () => {
    // Backend parser queries with an empty column selector return a frame whose
    // field name is omitted on the wire (json omitempty), so it arrives as undefined
    const frame: DataFrame = {
      fields: [{ name: undefined as unknown as string, type: FieldType.string, values: [null], config: {} }],
      length: 1,
    };
    const datasource = {
      name: 'Infinity',
      instanceSettings: { jsonData: {} },
      query: () => of({ data: [frame] }),
    } as unknown as Datasource;

    render(<VariableEditor query={query} onChange={mockOnChange} datasource={datasource} />);

    await waitFor(() => {
      expect(screen.getByText('Value Field')).toBeInTheDocument();
    });
  });
});
