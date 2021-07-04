import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { LegacyForms } from '@grafana/ui';
import { InfinityDataSourceJSONOptions } from '../../types';

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const URLEditor = (props: Props) => {
  const { FormField } = LegacyForms;
  const onURLChange = (url: string) => {
    props.onOptionsChange({
      ...props.options,
      url,
    });
  };
  return (
    <div className="gf-form">
      <FormField
        label="Base URL"
        labelWidth={11}
        tooltip="Base URL of the query. Leave blank if you want to handle it in the query editor."
        placeholder="Leave blank and you can specify full URL in the query."
        value={props.options.url}
        onChange={(e) => onURLChange(e.currentTarget.value)}
      />
    </div>
  );
};
