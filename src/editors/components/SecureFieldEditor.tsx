import React from 'react';
import { Button, LegacyForms, IconButton } from '@grafana/ui';
import { SecureField } from '../../types';

interface SecureFieldEditorProps {
  secureField: SecureField;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
  onChange: (value: SecureField) => void;
  onBlur: () => void;
}

export const SecureFieldEditor: React.FC<SecureFieldEditorProps> = ({
  secureField,
  onBlur,
  onChange,
  onRemove,
  onReset,
}) => {
  const { FormField, SecretFormField } = LegacyForms;
  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
  };
  return (
    <div style={layoutStyle}>
      <FormField
        label="Query String"
        name="name"
        placeholder="key"
        labelWidth={7}
        value={secureField.name || ''}
        onChange={e => onChange({ ...secureField, name: e.target.value })}
        onBlur={onBlur}
      ></FormField>
      <SecretFormField
        label="Value"
        name="value"
        isConfigured={secureField.configured}
        value={secureField.value}
        labelWidth={5}
        inputWidth={secureField.configured ? 11 : 12}
        placeholder="query string value"
        onReset={() => onReset(secureField.id)}
        onChange={e => onChange({ ...secureField, value: e.target.value })}
        onBlur={onBlur}
      ></SecretFormField>
      <Button
        type="button"
        aria-label="Remove Query String"
        variant="secondary"
        size="xs"
        onClick={_e => onRemove(secureField.id)}
      >
        <IconButton name="trash-alt" />
      </Button>
    </div>
  );
};
