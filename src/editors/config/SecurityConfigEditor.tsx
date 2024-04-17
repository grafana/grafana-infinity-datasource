import React from 'react';
import { InlineLabel, RadioButtonGroup } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { InfinityOptions, UnsecureQueryHandling } from './../../types';

type SecurityConfigEditorProps = DataSourcePluginOptionsEditorProps<InfinityOptions>;

export const SecurityConfigEditor = (props: SecurityConfigEditorProps) => {
  const { options, onOptionsChange } = props;
  const { jsonData } = options;
  const onUnsecureQueryHandlingChange = (unsecuredQueryHandling: UnsecureQueryHandling = 'warn') => {
    onOptionsChange({ ...options, jsonData: { ...jsonData, unsecuredQueryHandling } });
  };
  return (
    <>
      <div className="gf-form">
        <InlineLabel width={20} tooltip={'Option to handle insecure query content such as sensitive headers in the dashboard query'}>
          Query security
        </InlineLabel>
        <RadioButtonGroup<UnsecureQueryHandling>
          value={jsonData?.unsecuredQueryHandling || 'warn'}
          options={[
            { value: 'allow', label: 'Allow' },
            { value: 'warn', label: 'Warn' },
            { value: 'deny', label: 'Deny' },
          ]}
          onChange={(e) => onUnsecureQueryHandlingChange(e || 'warn')}
        />
      </div>
    </>
  );
};
