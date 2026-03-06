import { InlineFormLabel, TextArea, Input, Icon, Tooltip } from '@grafana/ui';
import React, { ChangeEvent, MouseEvent } from 'react';

export const VaultSecretNameInput = ({
  fieldName,
  vaultSecretName,
  onVaultMappingChange,
  width = 20,
  placeholder,
}: {
  fieldName: string;
  vaultSecretName: string;
  onVaultMappingChange: (fieldName: string, vaultSecretName: string) => void;
  width?: number;
  placeholder?: string;
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Tooltip content={`Vault secret name for "${fieldName}". If empty, "${fieldName}" is used as the vault key.`}>
        <Icon name="lock" style={{ color: '#6E9FFF', flexShrink: 0 }} />
      </Tooltip>
      <Input width={width} placeholder={placeholder || fieldName} value={vaultSecretName} onChange={(e) => onVaultMappingChange(fieldName, e.currentTarget.value)} />
    </div>
  );
};

export const SecureTextArea = ({
  configured,
  label,
  labelWidth,
  rows,
  onChange,
  onReset,
  onBlur,
  placeholder,
  isVaultEnabled,
  vaultSecretName,
  onVaultMappingChange,
  fieldName,
}: {
  label: string;
  labelWidth?: number;
  rows?: number;
  configured: boolean;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onReset: (event: MouseEvent<HTMLAnchorElement>) => void;
  onBlur?: () => void;
  /** Whether vault is enabled */
  isVaultEnabled?: boolean;
  /** Current vault secret name mapping */
  vaultSecretName?: string;
  /** Callback to update vault secret name mapping */
  onVaultMappingChange?: (fieldName: string, vaultSecretName: string) => void;
  /** The plugin's internal field name (e.g. "tlsCACert") */
  fieldName?: string;
}) => {
  if (isVaultEnabled && onVaultMappingChange && fieldName) {
    return (
      <div className="gf-form-inline">
        <InlineFormLabel width={labelWidth || 8}>{label}</InlineFormLabel>
        <VaultSecretNameInput fieldName={fieldName} vaultSecretName={vaultSecretName || ''} onVaultMappingChange={onVaultMappingChange} width={30} placeholder={fieldName} />
      </div>
    );
  }

  return (
    <div className="gf-form-inline">
      <InlineFormLabel width={labelWidth || 8}>{label}</InlineFormLabel>
      {configured ? (
        <div className="gf-form">
          <input type="text" className={'gf-form-input max-width-12'} disabled value="configured" />
          <a className="btn btn-secondary gf-form-btn" onClick={onReset}>
            reset
          </a>
        </div>
      ) : (
        <div className="gf-form gf-form--grow">
          <TextArea rows={rows || 5} onChange={onChange} onBlur={onBlur} placeholder={placeholder} />
        </div>
      )}
    </div>
  );
};
