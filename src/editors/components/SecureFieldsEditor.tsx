import React, { PureComponent } from 'react';
import uniqueId from 'lodash/uniqueId';
import { DataSourceSettings } from '@grafana/data';
import { Button } from '@grafana/ui';
import { SecureFieldEditor } from './SecureFieldEditor';
import { SecureField } from '../../types';

interface Props {
  dataSourceConfig: DataSourceSettings<any, any>;
  onChange: (config: DataSourceSettings) => void;
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
        .filter(key => key.startsWith('secureQueryName'))
        .map((key, index) => {
          return {
            id: uniqueId(),
            name: jsonData[key],
            value: secureJsonData !== undefined ? secureJsonData[key] : '',
            configured: (secureJsonFields && secureJsonFields[`secureQueryValue${index + 1}`]) || false,
          };
        }),
    };
  }

  updateSettings = () => {
    const { secureFields: queryStrings } = this.state;
    const newJsonData = Object.fromEntries(
      Object.entries(this.props.dataSourceConfig.jsonData).filter(([key, val]) => !key.startsWith('secureQueryName'))
    );
    const newSecureJsonData = Object.fromEntries(
      Object.entries(this.props.dataSourceConfig.secureJsonData || {}).filter(
        ([key, val]) => !key.startsWith('secureQueryValue')
      )
    );
    for (const [index, header] of queryStrings.entries()) {
      newJsonData[`secureQueryName${index + 1}`] = header.name;
      if (!header.configured) {
        newSecureJsonData[`secureQueryValue${index + 1}`] = header.value;
      }
    }
    this.props.onChange({
      ...this.props.dataSourceConfig,
      jsonData: newJsonData,
      secureJsonData: newSecureJsonData,
    });
  };

  onHeaderAdd = () => {
    this.setState(prevState => {
      return { secureFields: [...prevState.secureFields, { id: uniqueId(), name: '', value: '', configured: false }] };
    });
  };

  onHeaderChange = (headerIndex: number, value: SecureField) => {
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

  onHeaderReset = (headerId: string) => {
    this.setState(({ secureFields: headers }) => {
      return {
        secureFields: headers.map((h, i) => {
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

  onHeaderRemove = (headerId: string) => {
    this.setState(
      ({ secureFields: headers }) => ({
        secureFields: headers.filter(h => h.id !== headerId),
      }),
      this.updateSettings
    );
  };

  render() {
    const { secureFields: secureFields } = this.state;
    return (
      <div className={'gf-form-group'}>
        <div className="gf-form">
          <h6>Custom Query Strings</h6>
        </div>
        <div>
          {secureFields.map((header, i) => (
            <SecureFieldEditor
              key={header.id}
              secureField={header}
              onChange={h => {
                this.onHeaderChange(i, h);
              }}
              onBlur={this.updateSettings}
              onRemove={this.onHeaderRemove}
              onReset={this.onHeaderReset}
            />
          ))}
        </div>
        <div className="gf-form">
          <Button
            variant="secondary"
            icon="plus"
            type="button"
            onClick={e => {
              this.onHeaderAdd();
            }}
          >
            Add Query String
          </Button>
        </div>
      </div>
    );
  }
}
