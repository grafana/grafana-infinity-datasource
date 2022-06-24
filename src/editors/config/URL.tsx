import { LegacyForms } from '@grafana/ui';
import React, { useState } from 'react';
import { IGNORE_URL } from './../../constants';
import { AllowedHostsEditor } from './AllowedHosts';
import type { InfinityOptions } from './../../types';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data/types';

export const URLEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { FormField } = LegacyForms;
  const { options, onOptionsChange } = props;
  const [url, setUrl] = useState(options.url || '');
  const onURLChange = () => {
    onOptionsChange({ ...options, url: url || IGNORE_URL });
  };
  return (
    <>
      <div className="gf-form">
        <FormField
          label="Base URL"
          labelWidth={10}
          tooltip="Base URL of the query. Leave blank if you want to handle it in the query editor."
          placeholder="Leave blank and you can specify full URL in the query."
          value={url === IGNORE_URL ? '' : url}
          onChange={(e) => setUrl(e.currentTarget.value || '')}
          onBlur={onURLChange}
        />
        <div className="gf-form-label text-info">&lt;--- Deprecated field. Use full URL in the query editor instead.</div>
      </div>
      <AllowedHostsEditor options={options} onOptionsChange={onOptionsChange} />
    </>
  );
};
