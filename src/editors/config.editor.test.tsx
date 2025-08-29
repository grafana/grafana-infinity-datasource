import React from 'react';
import { render } from '@testing-library/react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { InfinityOptions } from '@/types';
import { InfinityConfigEditor } from './config.editor';

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

describe('InfinityConfigEditor', () => {
  const mockOnOptionsChange = jest.fn();

  // Freezing the object so that any mutations throw errors
  const mockProps: DataSourcePluginOptionsEditorProps<InfinityOptions> = Object.freeze({
    onOptionsChange: mockOnOptionsChange,
    options: {
      id: 1,
      access: '',
      basicAuth: false,
      basicAuthUser: '',
      database: '',
      isDefault: false,
      jsonData: Object.freeze({ auth_method: 'apiKey' }),
      name: '',
      orgId: 1,
      readOnly: false,
      secureJsonFields: Object.freeze({}),
      type: '',
      typeLogoUrl: '',
      typeName: '',
      uid: '',
      url: '',
      user: '',
      withCredentials: false,
      secureJsonData: Object.freeze({}),
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not mutate props with defaults', () => {
    const props = Object.freeze({ ...mockProps });

    // This would previously crash as the component mutated props
    render(<InfinityConfigEditor {...props} />);

    expect(mockProps.options.jsonData.global_queries).toBeUndefined();
    expect(props.options.jsonData.global_queries).toBeUndefined();
    expect(mockOnOptionsChange).not.toHaveBeenCalled();
  });
});
