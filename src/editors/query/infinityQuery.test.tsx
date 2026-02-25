import React from 'react';
import { render, within } from '@testing-library/react';
import { EditorMode, InfinityQuery, InfinityQueryFormat } from '@/types';
import { InfinityEditorProps, InfinityQueryEditor } from './infinityQuery';
import { Datasource } from '@/datasource';

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

describe('InfinityQueryEditor', () => {
  // Freezing the object so that any mutations throw errors
  const mockQuery: InfinityQuery = Object.freeze({
    refId: 'A',
    type: 'csv',
    source: 'url',
    url: 'http://example.com',
    parser: 'simple',
    format: 'node-graph-nodes' as InfinityQueryFormat,
    root_selector: '',
  }) as InfinityQuery;

  const mockOnChange = jest.fn();
  const mockOnRunQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not mutate props with defaults', () => {
    const props: InfinityEditorProps = Object.freeze({
      query: Object.freeze({ ...mockQuery }),
      onChange: mockOnChange,
      onRunQuery: mockOnRunQuery,
      instanceSettings: Object.freeze({ jsonData: Object.freeze({}) }),
      mode: 'standard' as EditorMode,
      datasource: Object.freeze({}) as Datasource,
    });

    // This would previously crash as the component mutated props
    const { getByTestId } = render(<InfinityQueryEditor {...props} />);

    // Verify that mockQuery.type shows up in UI
    const typeField = getByTestId('infinity-query-field-wrapper-type');
    expect(within(typeField).getByDisplayValue(/^CSV$/)).toBeInTheDocument();

    // Verify that mockQuery.parser shows up in UI
    const parserField = getByTestId('infinity-query-field-wrapper-parser');
    expect(within(parserField).getByDisplayValue('Frontend')).toBeInTheDocument();

    // Verify that mockQuery.format shows up in UI
    const formatField = getByTestId('infinity-query-field-wrapper-format');
    expect(within(formatField).getByDisplayValue(/^Nodes - Node Graph$/)).toBeInTheDocument();

    // Verify that mockQuery.url_options shows up in UI
    const methodField = getByTestId('infinity-query-field-wrapper-method');
    expect(within(methodField).getByDisplayValue(/^GET$/)).toBeInTheDocument();

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockOnRunQuery).not.toHaveBeenCalled();
  });
});
