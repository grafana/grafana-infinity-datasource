import { InlineFormLabel, Button, CodeEditor, Drawer, Select } from '@grafana/ui';
import React, { useState } from 'react';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import { isDataQuery } from './../../app/utils';
import { KeyValueEditor } from './../../components/KeyValuePairEditor';
import type { InfinityQuery, InfinityURLOptions, QueryBodyContentType, QueryBodyType } from './../../types';
import type { SelectableValue } from '@grafana/data';

export const URLEditor = (props: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  const canShowURLField = (isDataQuery(query) || query.type === 'uql' || query.type === 'groq') && query.source === 'url';
  const [data, setData] = useState((isDataQuery(query) || query.type === 'uql' || query.type === 'groq') && query.source === 'inline' ? query.data || '' : '');
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  const onDataChange = () => {
    onChange({ ...query, data });
    onRunQuery();
  };
  return (
    <>
      {canShowURLField ? (
        <>
          <EditorRow>
            <Method query={query} onChange={onChange} onRunQuery={onRunQuery} />
            <URL query={query} onChange={onChange} onRunQuery={onRunQuery} />
            <Headers query={query} onChange={onChange} onRunQuery={onRunQuery} />
            <QueryParams query={query} onChange={onChange} onRunQuery={onRunQuery} />
            <Body query={query} onChange={onChange} onRunQuery={onRunQuery} />
          </EditorRow>
        </>
      ) : (
        <EditorRow>
          <EditorField label="Data">
            <textarea
              rows={5}
              className="gf-form-input"
              style={{ width: '680px' }}
              value={data}
              placeholder=""
              onBlur={onDataChange}
              onChange={(e) => setData(e.target.value)}
              data-testid="infinity-query-inline-data-selector"
            />
          </EditorField>
        </EditorRow>
      )}
    </>
  );
};

const Method = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  if (query.source === 'inline') {
    return <></>;
  }
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
  return (
    <EditorField label="Method">
      <Select
        value={URL_METHODS.find((e) => e.value === (query.url_options.method || 'GET'))}
        defaultValue={URL_METHODS.find((e) => e.value === 'GET')}
        options={URL_METHODS}
        onChange={(e) => onMethodChange(e.value)}
      ></Select>
    </EditorField>
  );
};

const URL = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const [url, setURL] = useState((isDataQuery(query) || query.type === 'uql' || query.type === 'groq') && query.source === 'url' ? query.url || '' : '');
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  if (query.source !== 'url') {
    return <></>;
  }
  const onURLChange = () => {
    onChange({ ...query, url });
    onRunQuery();
  };
  return (
    <EditorField label="URL">
      <input
        type="text"
        className="gf-form-input"
        value={url}
        placeholder="https://jsonplaceholder.typicode.com/todos"
        style={{ width: '594px' }}
        onChange={(e) => setURL(e.currentTarget.value)}
        onBlur={onURLChange}
        data-testid="infinity-query-url-input"
      ></input>
    </EditorField>
  );
};

const Headers = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const [popupOpenStatus, setPopupOpenStatus] = useState(false);
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  if (query.source === 'inline') {
    return <></>;
  }
  const defaultHeader = {
    key: 'header-key',
    value: 'header-value',
  };
  return (
    <EditorField label="Headers">
      <>
        <Button size="sm" icon="shield" variant="secondary" title={'Configure headers'} onClick={() => setPopupOpenStatus(!popupOpenStatus)}>
          Configure
        </Button>
        {popupOpenStatus && (
          <Drawer
            title={'Headers'}
            onClose={() => setPopupOpenStatus(!popupOpenStatus)}
            expandable
            width="50%"
            subtitle={<p style={{ color: 'royalblue' }}>Note: DON&apos;T ADD ANY SENSITIVE INFORMATION HERE. Use datasource settings instead</p>}
          >
            <KeyValueEditor
              value={query.url_options?.headers || []}
              onChange={(v) => onChange({ ...query, url_options: { ...query.url_options, headers: v } })}
              defaultValue={defaultHeader}
              addButtonText="Add header"
            />
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
          </Drawer>
        )}
      </>
    </EditorField>
  );
};

const QueryParams = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const [popupOpenStatus, setPopupOpenStatus] = useState(false);
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  if (query.source === 'inline') {
    return <></>;
  }
  const defaultParam = {
    key: 'key',
    value: 'value',
  };
  return (
    <EditorField label="Query params">
      <>
        <Button size="sm" icon="shield" variant="secondary" title={'Configure query params'} onClick={() => setPopupOpenStatus(!popupOpenStatus)}>
          Configure
        </Button>
        {popupOpenStatus && (
          <Drawer
            title={'Headers'}
            onClose={() => setPopupOpenStatus(!popupOpenStatus)}
            expandable
            width="50%"
            subtitle={<p style={{ color: 'royalblue' }}>Note: DON&apos;T ADD ANY SENSITIVE INFORMATION HERE. Use datasource settings instead</p>}
          >
            <KeyValueEditor
              value={query.url_options?.params || []}
              onChange={(v) => onChange({ ...query, url_options: { ...query.url_options, params: v } })}
              defaultValue={defaultParam}
              addButtonText="Add query param"
            />
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
          </Drawer>
        )}
      </>
    </EditorField>
  );
};

const Body = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const [popupOpenStatus, setPopupOpenStatus] = useState(false);
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  if (query.source === 'inline') {
    return <></>;
  }
  const placeholderGraphQLQuery = `{ query : { }}`;
  const onURLOptionsChange = <K extends keyof InfinityURLOptions, V extends InfinityURLOptions[K]>(key: K, value: V) => {
    onChange({ ...query, url_options: { ...query.url_options, [key]: value } });
  };
  return query.url_options?.method === 'POST' ? (
    <EditorField label="Body">
      <>
        <Button size="sm" icon="shield" variant="secondary" title={'Configure body'} onClick={() => setPopupOpenStatus(!popupOpenStatus)}>
          Configure
        </Button>
        {popupOpenStatus && (
          <Drawer
            title={'Body'}
            onClose={() => setPopupOpenStatus(!popupOpenStatus)}
            expandable
            width="50%"
            subtitle={<p style={{ color: 'royalblue' }}>Note: DON&apos;T ADD ANY SENSITIVE INFORMATION HERE. Use datasource settings instead</p>}
          >
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
              </>
            ) : (
              <></>
            )}
          </Drawer>
        )}
      </>
    </EditorField>
  ) : (
    <></>
  );
};
