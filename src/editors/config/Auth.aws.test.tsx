import React from 'react';
import { render, screen } from '@testing-library/react';
import { config } from '@grafana/runtime';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { AuthEditor } from '@/editors/config/Auth';
import type { InfinityOptions } from '@/types';

// Mock Link components to avoid Router context issues (mirrors config.editor.test.tsx)
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

const renderAws = (aws: Record<string, unknown> = {}, secureJsonFields: Record<string, boolean> = {}) => {
  const props = {
    onOptionsChange: jest.fn(),
    options: {
      jsonData: { auth_method: 'aws', aws },
      secureJsonFields,
      secureJsonData: {},
    },
  } as unknown as DataSourcePluginOptionsEditorProps<InfinityOptions>;
  return render(<AuthEditor {...props} />);
};

describe('AWS auth editor', () => {
  const originalAllowedProviders = config.awsAllowedAuthProviders;
  const originalAssumeRoleEnabled = config.awsAssumeRoleEnabled;

  afterEach(() => {
    config.awsAllowedAuthProviders = originalAllowedProviders;
    config.awsAssumeRoleEnabled = originalAssumeRoleEnabled;
  });

  describe('authentication provider options', () => {
    it('renders only the providers allowed by the Grafana server config', () => {
      config.awsAllowedAuthProviders = ['keys'];
      config.awsAssumeRoleEnabled = false;
      renderAws();
      expect(screen.getByText('Access and secret key')).toBeInTheDocument();
      expect(screen.queryByText('AWS SDK Default')).not.toBeInTheDocument();
    });

    it('renders both providers when both are allowed', () => {
      config.awsAllowedAuthProviders = ['keys', 'default'];
      config.awsAssumeRoleEnabled = false;
      renderAws();
      expect(screen.getByText('Access and secret key')).toBeInTheDocument();
      expect(screen.getByText('AWS SDK Default')).toBeInTheDocument();
    });

    it('always renders the existing keys provider when no providers are allowed', () => {
      config.awsAllowedAuthProviders = [];
      config.awsAssumeRoleEnabled = false;
      renderAws();
      expect(screen.getByText('Access and secret key')).toBeInTheDocument();
      expect(screen.queryByText('AWS SDK Default')).not.toBeInTheDocument();
    });

    it('defaults to the existing keys provider when the saved provider is missing', () => {
      config.awsAllowedAuthProviders = ['default'];
      config.awsAssumeRoleEnabled = false;
      const { onOptionsChange } = renderAws();

      expect(screen.getByRole('radio', { name: 'Access and secret key' })).toBeChecked();
      expect(screen.getByText('Access Key ID')).toBeInTheDocument();
      expect(screen.getByText('Secret Access Key')).toBeInTheDocument();
      expect(onOptionsChange).not.toHaveBeenCalled();
    });

    it('falls back to keys when the saved default provider is no longer allowed', () => {
      config.awsAllowedAuthProviders = [];
      config.awsAssumeRoleEnabled = false;
      const { onOptionsChange } = renderAws({ authType: 'default' });

      expect(screen.getByRole('radio', { name: 'Access and secret key' })).toBeChecked();
      expect(onOptionsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          jsonData: expect.objectContaining({
            aws: expect.objectContaining({ authType: 'keys' }),
          }),
        })
      );
    });
  });

  describe('access key fields', () => {
    it('renders the renamed access key labels for the keys provider', () => {
      config.awsAllowedAuthProviders = ['keys', 'default'];
      renderAws({ authType: 'keys' });
      expect(screen.getByText('Access Key ID')).toBeInTheDocument();
      expect(screen.getByText('Secret Access Key')).toBeInTheDocument();
    });

    it('hides the access key fields for the default provider', () => {
      config.awsAllowedAuthProviders = ['keys', 'default'];
      renderAws({ authType: 'default' });
      expect(screen.queryByText('Access Key ID')).not.toBeInTheDocument();
      expect(screen.queryByText('Secret Access Key')).not.toBeInTheDocument();
    });
  });

  describe('assume role fields', () => {
    it('hides the assume role fields when assume role is disabled on the server', () => {
      config.awsAllowedAuthProviders = ['keys', 'default'];
      config.awsAssumeRoleEnabled = false;
      renderAws();
      expect(screen.queryByText('Assume Role ARN')).not.toBeInTheDocument();
      expect(screen.queryByText('External ID')).not.toBeInTheDocument();
    });

    it('shows the assume role ARN field when assume role is enabled on the server', () => {
      config.awsAllowedAuthProviders = ['keys', 'default'];
      config.awsAssumeRoleEnabled = true;
      renderAws();
      expect(screen.getByText('Assume Role ARN')).toBeInTheDocument();
      // External ID stays hidden until an ARN has been entered
      expect(screen.queryByText('External ID')).not.toBeInTheDocument();
    });

    it('shows the external id field once an ARN is set', () => {
      config.awsAllowedAuthProviders = ['keys', 'default'];
      config.awsAssumeRoleEnabled = true;
      renderAws({ authType: 'default', assumeRoleArn: 'arn:aws:iam::123456789012:role/MyRole' });
      expect(screen.getByText('External ID')).toBeInTheDocument();
    });
  });
});
