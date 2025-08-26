import React from 'react';
import { render, within } from '@testing-library/react';
import { QueryEditorProps } from '@grafana/data';
import { Datasource } from '@/datasource';
import { InfinityQuery, InfinityQueryFormat } from '@/types';
import { QueryEditor } from './query.editor';

// Mock react-router-dom Link component
jest.mock('react-router-dom', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe('QueryEditor', () => {
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
    const props: QueryEditorProps<Datasource, InfinityQuery> = Object.freeze({
      query: Object.freeze({ ...mockQuery }),
      onChange: mockOnChange,
      onRunQuery: mockOnRunQuery,
      datasource: Object.freeze({ instanceSettings: Object.freeze({ jsonData: Object.freeze({}) }) }) as Datasource,
    });

    // This would previously crash as the component mutated props
    const { getByTestId } = render(<QueryEditor {...props} />);

    // Verify that mockQuery.type shows up in UI
    const typeField = getByTestId('infinity-query-field-wrapper-type');
    expect(within(typeField).getByText(/^CSV$/)).toBeInTheDocument();

    // Verify that mockQuery.parser shows up in UI
    const parserField = getByTestId('infinity-query-field-wrapper-parser');
    expect(within(parserField).getByText(/^Frontend$/)).toBeInTheDocument();

    // Verify that mockQuery.format shows up in UI
    const formatField = getByTestId('infinity-query-field-wrapper-format');
    expect(within(formatField).getByText(/^Nodes - Node Graph$/)).toBeInTheDocument();

    // Verify that mockQuery.url_options shows up in UI
    const methodField = getByTestId('infinity-query-field-wrapper-method');
    expect(within(methodField).getByText(/^GET$/)).toBeInTheDocument();

    expect(mockOnChange).not.toHaveBeenCalled();
    expect(mockOnRunQuery).not.toHaveBeenCalled();
  });
});
