import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { LegacyForms } from '@grafana/ui';
import { InfinityDataSourceJSONOptions } from '../../types';

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const URLEditor: React.FC<Props> = (props: Props) => {
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
        label="URL"
        labelWidth={11}
        tooltip="URL of the query. Leave blank if you want to handle it in the query editor."
        value={props.options.url}
        onChange={(e) => onURLChange(e.currentTarget.value)}
      />
    </div>
  );
};
