import { Button, CodeEditor, CollapsableSection, CustomScrollbar, Drawer, InlineFormLabel, Select } from '@grafana/ui';
import React, { useState } from 'react';
import { isDataQuery } from './../../app/utils';
import { KeyValueEditor } from './../../components/KeyValuePairEditor';
import type { InfinityQuery, InfinityURLOptions, QueryBodyContentType, QueryBodyType } from './../../types';
import type { SelectableValue } from '@grafana/data';

export const URLOptionsEditor = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const [popupOpenStatus, setPopupOpenStatus] = useState(false);
  if (!((isDataQuery(query) || query.type === 'uql') && query.source === 'url')) {
    return <></>;
  }
  const btnText = 'HTTP method, Query param, Headers';
  const btnTitle = 'Expand for advanced query options like method, body, etc';
  const placeholderGraphQLQuery = `{ query : { }}`;
  const defaultHeader = {
    key: 'header-key',
    value: 'header-value',
  };
  const defaultParam = {
    key: 'key',
    value: 'value',
  };
  const URL_METHODS: SelectableValue[] = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
  ];
  const onMethodChange = (method: 'GET' | 'POST') => {
    onChange({
      ...query,
      url_options: {
        ...query.url_options,
        method,
      },
    });
    onRunQuery();
  };
  const onURLOptionsChange = <K extends keyof InfinityURLOptions, V extends InfinityURLOptions[K]>(key: K, value: V) => {
    onChange({ ...query, url_options: { ...query.url_options, [key]: value } });
  };
  return (
    <>
      <Button size="sm" icon="shield" variant="secondary" title={btnTitle} onClick={() => setPopupOpenStatus(!popupOpenStatus)}>
        {btnText}
      </Button>
      {popupOpenStatus && (
        <Drawer
          title={'URL Options'}
          onClose={() => setPopupOpenStatus(!popupOpenStatus)}
          expandable
          width="50%"
          subtitle={<p style={{ color: 'royalblue' }}>Note: DON&apos;T ADD ANY SENSITIVE INFORMATION HERE. Use datasource settings instead</p>}
        >
          <CustomScrollbar autoHeightMin="100%">
            <CollapsableSection label="Method &amp; Body" isOpen={true}>
              <>
                <div className="gf-form">
                  <InlineFormLabel width={15}>Method</InlineFormLabel>
                  <Select
                    value={URL_METHODS.find((e) => e.value === (query.url_options.method || 'GET'))}
                    defaultValue={URL_METHODS.find((e) => e.value === 'GET')}
                    options={URL_METHODS}
                    onChange={(e) => onMethodChange(e.value)}
                  ></Select>
                </div>
                {query.url_options.method === 'POST' ? (
                  <>
                    <div className="gf-form">
                      <InlineFormLabel width={15}>Body Type</InlineFormLabel>
                      <Select<QueryBodyType>
                        value={query.url_options.body_type || 'raw'}
                        options={[
                          { value: 'none', label: 'None' },
                          { value: 'form-data', label: 'Form Data' },
                          { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
                          { value: 'raw', label: 'Raw' },
                          { value: 'graphql', label: 'GraphQL' },
                        ]}
                        onChange={(e) => onURLOptionsChange('body_type', e?.value ?? 'raw')}
                      ></Select>
                    </div>
                    {(query.url_options?.body_type === 'form-data' || query.url_options?.body_type === 'x-www-form-urlencoded') && (
                      <KeyValueEditor value={query.url_options.body_form || []} onChange={(e) => onURLOptionsChange('body_form', e)} addButtonText="Add form item" />
                    )}
                    {query.url_options?.body_type === 'graphql' && (
                      <>
                        <div className="gf-form">
                          <InlineFormLabel width={15} tooltip={'write your Graphql query below. Example query:  ' + placeholderGraphQLQuery}>
                            Query
                          </InlineFormLabel>
                        </div>
                        <CodeEditor
                          language="graphql"
                          height={'200px'}
                          value={query.url_options?.body_graphql_query || ''}
                          onSave={(e) => onURLOptionsChange('body_graphql_query', e)}
                          onBlur={(e) => onURLOptionsChange('body_graphql_query', e)}
                        />
                        {/* <div className="gf-form" style={{ marginTop: '5px' }}>
                          <InlineFormLabel width={15} tooltip="Define variables in JSON format to use in the query">
                            Variables
                          </InlineFormLabel>
                        </div>
                        <CodeEditor
                          language="json"
                          height={'200px'}
                          value={query.url_options?.body_graphql_variables || ''}
                          onSave={(e) => onURLOptionsChange('body_graphql_variables', e)}
                          onBlur={(e) => onURLOptionsChange('body_graphql_variables', e)}
                        /> */}
                      </>
                    )}
                    {(query.url_options?.body_type === 'raw' || !query.url_options?.body_type) && (
                      <>
                        <div className="gf-form">
                          <InlineFormLabel width={15}>Body Content Type</InlineFormLabel>
                          <Select<QueryBodyContentType>
                            value={query.url_options?.body_content_type || 'text/plain'}
                            options={[
                              { value: 'text/plain', label: 'Text' },
                              { value: 'application/json', label: 'JSON' },
                              { value: 'application/xml', label: 'XML' },
                              { value: 'text/html', label: 'HTML' },
                              { value: 'application/javascript', label: 'JavaScript' },
                            ]}
                            onChange={(e) => onURLOptionsChange('body_content_type', e?.value ?? 'text/plain')}
                          ></Select>
                        </div>
                        <div className="gf-form">
                          <InlineFormLabel width={15}>Body Content</InlineFormLabel>
                        </div>
                        <CodeEditor
                          language={
                            query.url_options?.body_content_type === 'application/json'
                              ? 'json'
                              : query.url_options?.body_content_type === 'application/xml'
                              ? 'xml'
                              : query.url_options?.body_content_type === 'text/html'
                              ? 'html'
                              : query.url_options?.body_content_type === 'application/javascript'
                              ? 'javascript'
                              : query.url_options?.body_content_type === 'text/plain'
                              ? 'text'
                              : 'text'
                          }
                          height={'200px'}
                          value={query.url_options?.data || ''}
                          onSave={(e) => {
                            onURLOptionsChange('data', e);
                            onRunQuery();
                          }}
                          onBlur={(e) => {
                            onURLOptionsChange('data', e);
                            onRunQuery();
                          }}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </>
            </CollapsableSection>
            <CollapsableSection label="Query Params" isOpen={true}>
              <KeyValueEditor
                value={query.url_options?.params || []}
                onChange={(v) => onChange({ ...query, url_options: { ...query.url_options, params: v } })}
                defaultValue={defaultParam}
                addButtonText="Add query param"
              />
            </CollapsableSection>
            <CollapsableSection label="Headers" isOpen={true}>
              <KeyValueEditor
                value={query.url_options?.headers || []}
                onChange={(v) => onChange({ ...query, url_options: { ...query.url_options, headers: v } })}
                defaultValue={defaultHeader}
                addButtonText="Add header"
              />
            </CollapsableSection>
            <div style={{ textAlign: 'center', margin: '30px' }}>
              <Button
                style={{ margin: '5px' }}
                onClick={() => {
                  setPopupOpenStatus(false);
                  onRunQuery();
                }}
              >
                Close and Run
              </Button>
              <Button variant="secondary" style={{ margin: '5px' }} onClick={() => onRunQuery()}>
                Run
              </Button>
            </div>
          </CustomScrollbar>
        </Drawer>
      )}
    </>
  );
};
