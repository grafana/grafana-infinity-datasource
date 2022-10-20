import React, { useState } from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { InlineFormLabel, Button, CodeEditor, Drawer, Select, Input, useStyles2 } from '@grafana/ui';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import { Stack } from './../../components/extended/Stack';
import { isDataQuery } from './../../app/utils';
import { KeyValueEditor } from './../../components/KeyValuePairEditor';
import type { InfinityQuery, InfinityURLOptions, QueryBodyContentType, QueryBodyType } from './../../types';
import type { SelectableValue } from '@grafana/data/types';

export const URLEditor = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  return isDataQuery(query) && query.source === 'url' ? (
    <EditorRow label="URL options" collapsible={false} collapsed={true} title={() => 'Method, Body, Additional headers & parameters'}>
      <Stack gap={1}>
        <Method query={query} onChange={onChange} onRunQuery={onRunQuery} />
        <Headers query={query} onChange={onChange} onRunQuery={onRunQuery} />
        <QueryParams query={query} onChange={onChange} onRunQuery={onRunQuery} />
        <Body query={query} onChange={onChange} onRunQuery={onRunQuery} />
      </Stack>
    </EditorRow>
  ) : (
    <></>
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
    <EditorField label="HTTP Method">
      <Select
        width={18}
        value={URL_METHODS.find((e) => e.value === (query.url_options.method || 'GET'))}
        defaultValue={URL_METHODS.find((e) => e.value === 'GET')}
        options={URL_METHODS}
        onChange={(e) => onMethodChange(e.value)}
      ></Select>
    </EditorField>
  );
};

export const URL = ({ query, onChange, onRunQuery, onShowUrlOptions }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void; onShowUrlOptions: () => void }) => {
  const styles = useStyles2(getStyles);
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
    <EditorField
      label="URL"
      tooltip="Click options configure HTTP Method, Body, Additional headers and Query parameters"
      promoNode={
        <span title="Method, Body, Headers and Params" onClick={onShowUrlOptions} className={styles.url.promoNode}>
          Options
        </span>
      }
    >
      <Input
        type="text"
        value={url}
        placeholder={`https://github.com/yesoreyeram/grafana-infinity-datasource/blob/main/testdata/users.${
          query.type === 'graphql' || query.type === 'uql' || query.type === 'groq' ? 'json' : query.type
        }`}
        width={80}
        onChange={(e) => setURL(e.currentTarget.value)}
        onBlur={onURLChange}
        data-testid="infinity-query-url-input"
      ></Input>
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
    <EditorField label="HTTP Headers">
      <>
        <Button
          size="sm"
          style={{ marginTop: '5px' }}
          variant="secondary"
          title={'Configure headers'}
          onClick={(e) => {
            setPopupOpenStatus(!popupOpenStatus);
            e.preventDefault();
          }}
        >
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
    <EditorField label="URL Query Params">
      <>
        <Button
          size="sm"
          variant="secondary"
          style={{ marginTop: '5px' }}
          title={'Configure query params'}
          onClick={(e) => {
            setPopupOpenStatus(!popupOpenStatus);
            e.preventDefault();
          }}
        >
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
    <EditorField label="HTTP POST Body">
      <>
        <Button
          size="sm"
          style={{ marginTop: '5px' }}
          variant="secondary"
          title={'Configure body'}
          onClick={(e) => {
            setPopupOpenStatus(!popupOpenStatus);
            e.preventDefault();
          }}
        >
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

const getStyles = (theme: GrafanaTheme2) => {
  return {
    url: {
      promoNode: css({
        marginLeft: '10px',
        color: theme.colors.info.border,
      }),
    },
  };
};
