import { Button, LegacyForms } from '@grafana/ui';
import uniqueId from 'lodash/uniqueId';
import React, { PureComponent } from 'react';
import { InfinityOptions, SecureField } from './../../types';
import type { DataSourceSettings } from '@grafana/data';

const SecureFieldEditor = ({
  title,
  secureField,
  onBlur,
  onChange,
  onRemove,
  onReset,
  label,
  labelWidth,
}: {
  title: string;
  secureField: SecureField;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
  onChange: (value: SecureField) => void;
  onBlur: () => void;
  labelWidth?: number;
  label?: string;
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
        label={label || 'Key'}
        labelWidth={labelWidth || 8}
        name="name"
        placeholder="key"
        value={secureField.name || ''}
        onChange={(e) => onChange({ ...secureField, name: e.target.value })}
        onBlur={onBlur}
      ></FormField>
      <SecretFormField
        label="Value"
        name="value"
        isConfigured={secureField.configured}
        value={secureField.value}
        labelWidth={5}
        inputWidth={secureField.configured ? 11 : 12}
        placeholder={`${title} value`}
        onReset={() => onReset(secureField.id)}
        onChange={(e) => onChange({ ...secureField, value: e.target.value })}
        onBlur={onBlur}
      ></SecretFormField>
      <Button style={{ marginInlineStart: '4px' }} aria-label={`Remove ${title}`} icon="trash-alt" variant="destructive" fill="outline" onClick={(_e) => onRemove(secureField.id)} />
    </div>
  );
};

interface Props {
  title: string;
  hideTile?: boolean;
  secureFieldName: string;
  secureFieldValue: string;
  dataSourceConfig: DataSourceSettings<any, any>;
  onChange: (config: DataSourceSettings<InfinityOptions>) => void;
  label?: string;
  labelWidth?: number;
}

interface State {
  secureFields: SecureField[];
}

export class SecureFieldsEditor extends PureComponent<Props, State> {
  state: State = {
    secureFields: [],
  };

  constructor(props: Props) {
    super(props);
    const { jsonData, secureJsonData, secureJsonFields } = this.props.dataSourceConfig;
    this.state = {
      secureFields: Object.keys(jsonData)
        .sort()
        .filter((key) => key.startsWith(this.props.secureFieldName))
        .map((key, index) => {
          return {
            id: uniqueId(),
            name: jsonData[key],
            value: secureJsonData !== undefined ? secureJsonData[key] : '',
            configured: (secureJsonFields && secureJsonFields[`${this.props.secureFieldValue}${index + 1}`]) || false,
          };
        }),
    };
  }

  updateSettings = () => {
    const { secureFields } = this.state;
    const newJsonData = Object.fromEntries(Object.entries(this.props.dataSourceConfig.jsonData).filter(([key, val]) => !key.startsWith(this.props.secureFieldName)));
    const newSecureJsonData = Object.fromEntries(Object.entries(this.props.dataSourceConfig.secureJsonData || {}).filter(([key, val]) => !key.startsWith(this.props.secureFieldValue)));
    for (const [index, header] of secureFields.entries()) {
      newJsonData[`${this.props.secureFieldName}${index + 1}`] = header.name;
      if (!header.configured) {
        newSecureJsonData[`${this.props.secureFieldValue}${index + 1}`] = header.value;
      }
    }
    this.props.onChange({
      ...this.props.dataSourceConfig,
      jsonData: newJsonData,
      secureJsonData: newSecureJsonData,
    });
  };

  onSecureFieldAdd = () => {
    this.setState((prevState) => {
      return { secureFields: [...prevState.secureFields, { id: uniqueId(), name: '', value: '', configured: false }] };
    });
  };

  onSecureFieldChange = (headerIndex: number, value: SecureField) => {
    this.setState(({ secureFields: headers }) => {
      return {
        secureFields: headers.map((item, index) => {
          if (headerIndex !== index) {
            return item;
          }
          return { ...value };
        }),
      };
    });
  };

  onSecureFieldReset = (headerId: string) => {
    this.setState(({ secureFields: headers }) => {
      return {
        secureFields: headers.map((h) => {
          if (h.id !== headerId) {
            return h;
          }
          return {
            ...h,
            value: '',
            configured: false,
          };
        }),
      };
    });
  };

  onSecureFieldRemove = (headerId: string) => {
    this.setState(
      ({ secureFields: headers }) => ({
        secureFields: headers.filter((h) => h.id !== headerId),
      }),
      this.updateSettings
    );
  };

  render() {
    const { secureFields } = this.state;
    return (
      <>
        {!this.props.hideTile && <h6>{this.props.title}s</h6>}
        <div className="gf-form-inline">
          <div className="gf-form">
            <div>
              {secureFields.map((sf, i) => (
                <SecureFieldEditor
                  title={this.props.title}
                  key={sf.id}
                  secureField={sf}
                  onChange={(h) => this.onSecureFieldChange(i, h)}
                  onBlur={this.updateSettings}
                  onRemove={this.onSecureFieldRemove}
                  onReset={this.onSecureFieldReset}
                  label={this.props.label}
                  labelWidth={this.props.labelWidth}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="gf-form">
          <Button variant="secondary" icon="plus" type="button" onClick={() => this.onSecureFieldAdd()}>
            Add {this.props.title}
          </Button>
        </div>
      </>
    );
  }
}
