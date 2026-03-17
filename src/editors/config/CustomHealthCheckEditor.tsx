import React from 'react';
import { CodeEditor, Combobox, InlineFormLabel, InlineLabel, InlineSwitch, Input, RadioButtonGroup, Stack, type ComboboxOption } from '@grafana/ui';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { KeyValueEditor } from '@/components/KeyValuePairEditor';
import type { InfinityOptions, InfinityURLMethod, InfinityURLOptions, QueryBodyContentType, QueryBodyType } from '@/types';

export const CustomHealthCheckEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { jsonData = {} } = options;
  const urlOptions = jsonData.customHealthCheckUrlOptions || { method: 'GET' as InfinityURLMethod };

  const onUrlOptionsChange = <K extends keyof InfinityURLOptions>(key: K, value: InfinityURLOptions[K]) => {
    onOptionsChange({
      ...options,
      jsonData: {
        ...jsonData,
        customHealthCheckUrlOptions: { ...urlOptions, [key]: value },
      },
    });
  };

  const SAFE_URL_METHODS: Array<ComboboxOption<InfinityURLMethod>> = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
  ];
  const DANGEROUS_URL_METHODS: Array<ComboboxOption<InfinityURLMethod>> = [
    { label: 'PUT', value: 'PUT' },
    { label: 'PATCH', value: 'PATCH' },
    { label: 'DELETE', value: 'DELETE' },
  ];
  const URL_METHODS = [...SAFE_URL_METHODS, ...(jsonData.allowDangerousHTTPMethods ? DANGEROUS_URL_METHODS : [])];

  const doesBodyAllowed = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(urlOptions.method);

  return (
    <>
      <div className="gf-form">
        <InlineLabel width={36}>Enable custom health check</InlineLabel>
        <InlineSwitch
          value={jsonData.customHealthCheckEnabled || false}
          onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, customHealthCheckEnabled: e.currentTarget.checked } })}
        />
      </div>
      {jsonData.customHealthCheckEnabled && (
        <>
          <div className="gf-form">
            <InlineLabel width={36}>Health check URL</InlineLabel>
            <Input
              value={jsonData.customHealthCheckUrl || ''}
              placeholder="https://jsonplaceholder.typicode.com/users"
              onChange={(e) => onOptionsChange({ ...options, jsonData: { ...jsonData, customHealthCheckUrl: e.currentTarget.value || '' } })}
            />
          </div>
          <div className="gf-form">
            <InlineLabel width={36} tooltip="HTTP method for health check request. Enable 'Allow dangerous HTTP methods' in the URL section to use PUT, PATCH, DELETE.">
              Method
            </InlineLabel>
            <Combobox
              width={16}
              value={URL_METHODS.find((e) => e.value === urlOptions.method)?.value || DANGEROUS_URL_METHODS.find((e) => e.value === urlOptions.method)?.value || 'GET'}
              options={URL_METHODS}
              onChange={(e) => onUrlOptionsChange('method', (e.value as InfinityURLMethod) || 'GET')}
            />
          </div>
          <div className="gf-form">
            <InlineLabel width={36}>Headers</InlineLabel>
          </div>
          <KeyValueEditor value={urlOptions.headers || []} onChange={(v) => onUrlOptionsChange('headers', v)} defaultValue={{ key: 'header-key', value: 'header-value' }} addButtonText="Add header" />
          <div className="gf-form">
            <InlineLabel width={36}>Query parameters</InlineLabel>
          </div>
          <KeyValueEditor value={urlOptions.params || []} onChange={(v) => onUrlOptionsChange('params', v)} defaultValue={{ key: 'key', value: 'value' }} addButtonText="Add query param" />
          {doesBodyAllowed && (
            <>
              <div className="gf-form">
                <InlineLabel width={36}>Body type</InlineLabel>
              </div>
              <Stack direction="column">
                <RadioButtonGroup<QueryBodyType>
                  value={urlOptions.body_type || 'raw'}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'raw', label: 'Raw' },
                    { value: 'form-data', label: 'Form Data' },
                    { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
                    { value: 'graphql', label: 'GraphQL' },
                  ]}
                  onChange={(e) => onUrlOptionsChange('body_type', e || 'raw')}
                />
                {(urlOptions.body_type === 'form-data' || urlOptions.body_type === 'x-www-form-urlencoded') && (
                  <KeyValueEditor value={urlOptions.body_form || []} onChange={(e) => onUrlOptionsChange('body_form', e)} addButtonText="Add form item" />
                )}
                {urlOptions.body_type === 'graphql' && (
                  <>
                    <div className="gf-form">
                      <InlineFormLabel width={15}>GraphQL query</InlineFormLabel>
                    </div>
                    <CodeEditor
                      language="graphql"
                      height={'200px'}
                      value={urlOptions.body_graphql_query || ''}
                      onSave={(e) => onUrlOptionsChange('body_graphql_query', e)}
                      onBlur={(e) => onUrlOptionsChange('body_graphql_query', e)}
                    />
                    <div className="gf-form">
                      <InlineFormLabel width={15}>GraphQL Variables</InlineFormLabel>
                    </div>
                    <CodeEditor
                      language="json"
                      height={'200px'}
                      value={urlOptions.body_graphql_variables || '{}'}
                      onSave={(e) => onUrlOptionsChange('body_graphql_variables', e)}
                      onBlur={(e) => onUrlOptionsChange('body_graphql_variables', e)}
                    />
                  </>
                )}
                {(urlOptions.body_type === 'raw' || !urlOptions.body_type) && (
                  <>
                    <div className="gf-form">
                      <InlineFormLabel width={15}>Body Content Type</InlineFormLabel>
                      <Combobox
                        value={urlOptions.body_content_type || 'text/plain'}
                        options={[
                          { value: 'text/plain', label: 'Text' },
                          { value: 'application/json', label: 'JSON' },
                          { value: 'application/xml', label: 'XML' },
                          { value: 'text/html', label: 'HTML' },
                          { value: 'application/javascript', label: 'JavaScript' },
                        ]}
                        onChange={(e) => onUrlOptionsChange('body_content_type', (e?.value as QueryBodyContentType) ?? 'text/plain')}
                      />
                    </div>
                    <div className="gf-form">
                      <InlineFormLabel width={15}>Body Content</InlineFormLabel>
                    </div>
                    <CodeEditor
                      language={
                        urlOptions.body_content_type === 'application/json'
                          ? 'json'
                          : urlOptions.body_content_type === 'application/xml'
                            ? 'xml'
                            : urlOptions.body_content_type === 'text/html'
                              ? 'html'
                              : urlOptions.body_content_type === 'application/javascript'
                                ? 'javascript'
                                : 'text'
                      }
                      height={'200px'}
                      value={urlOptions.data || ''}
                      onSave={(e) => onUrlOptionsChange('data', e)}
                      onBlur={(e) => onUrlOptionsChange('data', e)}
                    />
                  </>
                )}
              </Stack>
            </>
          )}
        </>
      )}
    </>
  );
};
