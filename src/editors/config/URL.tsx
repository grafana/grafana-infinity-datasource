import React, { useState } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { LegacyForms } from '@grafana/ui';
import { InfinityOptions, IGNORE_URL } from '../../types';

export type Props = DataSourcePluginOptionsEditorProps<InfinityOptions>;

export const URLEditor = (props: Props) => {
  const { FormField } = LegacyForms;
  const { options, onOptionsChange } = props;
  const [url, setUrl] = useState(options.url || '');
  const onURLChange = () => {
    onOptionsChange({ ...options, url: url || IGNORE_URL });
  };
  return (
    <div className="gf-form">
      <FormField
        label="Base URL"
        labelWidth={11}
        tooltip="Base URL of the query. Leave blank if you want to handle it in the query editor."
        placeholder="Leave blank and you can specify full URL in the query."
        value={url === IGNORE_URL ? '' : url}
        onChange={(e) => setUrl(e.currentTarget.value || '')}
        onBlur={onURLChange}
      />
      <div className="gf-form-label text-warning">Deprecated field. Use URL in the query editor instead.</div>
    </div>
  );
};
