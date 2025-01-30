import React, { useEffect, useState } from 'react';
import { InlineFormLabel, CodeEditor, Select, Input, RadioButtonGroup, Icon, Stack } from '@grafana/ui';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import { isDataQuery } from './../../app/utils';
import { KeyValueEditor } from './../../components/KeyValuePairEditor';
import type { InfinityQuery, InfinityQueryType, InfinityQueryWithURLSource, InfinityURLOptions, QueryBodyContentType, QueryBodyType } from './../../types';
import type { SelectableValue } from '@grafana/data';
import { usePrevious } from 'react-use';

export const URLEditor = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  return isDataQuery(query) && query.source === 'url' ? (
    <EditorRow label="URL options" collapsible={true} collapsed={true} title={() => 'Method, Body, Additional headers & parameters'}>
      <Stack gap={1}>
        <Body query={query} onChange={onChange} onRunQuery={onRunQuery} />
        <Headers query={query} onChange={onChange} onRunQuery={onRunQuery} />
        <QueryParams query={query} onChange={onChange} onRunQuery={onRunQuery} />
      </Stack>
    </EditorRow>
  ) : (
    <></>
  );
};

export const Method = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  if (query.source === 'inline' || query.source === 'azure-blob') {
    return <></>;
  }
  const URL_METHODS: SelectableValue[] = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
  ];
  const onMethodChange = (method: 'GET' | 'POST') => {
    if (query.source === 'url') {
      onChange({
        ...query,
        url_options: {
          ...query.url_options,
          method,
        },
      });
    }
    onRunQuery();
  };
  if (query.source !== 'url') {
    return <></>;
  }
  return (
    <EditorField label="Method" horizontal={true}>
      <Select
        width={16}
        value={URL_METHODS.find((e) => e.value === (query.url_options.method || 'GET'))}
        defaultValue={URL_METHODS.find((e) => e.value === 'GET')}
        options={URL_METHODS}
        onChange={(e) => onMethodChange(e.value)}
      ></Select>
    </EditorField>
  );
};

export const URL = ({
  query,
  onChange,
  onRunQuery,
  onShowUrlOptions,
}: {
  query: InfinityQueryWithURLSource<InfinityQueryType>;
  onChange: (value: InfinityQueryWithURLSource<InfinityQueryType>) => void;
  onRunQuery: () => void;
  onShowUrlOptions: () => void;
}) => {
  const [url, setURL] = useState(query.url);
  const previousUrl = usePrevious(query.url);

  useEffect(() => {
    if (query.url !== previousUrl && query.url !== url) {
      setURL(query.url);
    }
  }, [query.url, previousUrl, url]);

  const onURLChange = () => {
    onChange({ ...query, url });
    onRunQuery();
  };

  return (
    <EditorField label="URL" horizontal={true}>
      <Input
        type="text"
        value={url}
        placeholder={`https://github.com/grafana/grafana-infinity-datasource/blob/main/testdata/users.${
          query.type === 'graphql' || query.type === 'uql' || query.type === 'groq' ? 'json' : query.type
        }`}
        width={84}
        onChange={(e) => setURL(e.currentTarget.value)}
        onBlur={onURLChange}
        data-testid="infinity-query-url-input"
      ></Input>
    </EditorField>
  );
};

const Headers = ({ query, onChange }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  if (query.source === 'inline' || query.source === 'reference' || query.source === 'azure-blob') {
    return <></>;
  }
  const defaultHeader = {
    key: 'header-key',
    value: 'header-value',
  };
  return (
    <EditorField label="HTTP Headers" tooltip={`Add additional headers. Don't add any secure fields here. Use config instead`}>
      <KeyValueEditor
        value={query.url_options?.headers || []}
        onChange={(v) => onChange({ ...query, url_options: { ...query.url_options, headers: v } })}
        defaultValue={defaultHeader}
        addButtonText="Add header"
      />
    </EditorField>
  );
};

const QueryParams = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  if (query.source === 'inline' || query.source === 'reference' || query.source === 'azure-blob') {
    return <></>;
  }
  const defaultParam = {
    key: 'key',
    value: 'value',
  };
  return (
    <EditorField label="URL Query Params" tooltip={`Add additional query parameters. Don't add any secure fields here. Use config instead`}>
      <KeyValueEditor
        value={query.url_options?.params || []}
        onChange={(v) => onChange({ ...query, url_options: { ...query.url_options, params: v } })}
        defaultValue={defaultParam}
        addButtonText="Add query param"
      />
    </EditorField>
  );
};

const Body = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  if (!(isDataQuery(query) || query.type === 'uql' || query.type === 'groq')) {
    return <></>;
  }
  if (query.source === 'inline' || query.source === 'reference' || query.source === 'azure-blob') {
    return <></>;
  }
  const placeholderGraphQLQuery = `{ query : { }}`;
  const placeholderGraphQLVariables = `{ }`;
  const onURLOptionsChange = <K extends keyof InfinityURLOptions, V extends InfinityURLOptions[K]>(key: K, value: V) => {
    onChange({ ...query, url_options: { ...query.url_options, [key]: value } });
  };
  return query.url_options?.method === 'POST' ? (
    <>
      <Stack direction="column">
        <EditorField label="Body Type">
          <>
            <RadioButtonGroup<QueryBodyType>
              value={query.url_options.body_type || 'raw'}
              options={[
                { value: 'none', label: 'None' },
                { value: 'raw', label: 'Raw' },
                { value: 'form-data', label: 'Form Data' },
                { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
                { value: 'graphql', label: 'GraphQL' },
              ]}
              onChange={(e) => onURLOptionsChange('body_type', e || 'raw')}
            ></RadioButtonGroup>
            {(query.url_options?.body_type === 'form-data' || query.url_options?.body_type === 'x-www-form-urlencoded') && (
              <>
                <br />
                <br />
                <KeyValueEditor value={query.url_options.body_form || []} onChange={(e) => onURLOptionsChange('body_form', e)} addButtonText="Add form item" />
              </>
            )}
            {query.url_options?.body_type === 'graphql' && (
              <>
                <br />
                <br />
                <EditorField label="GraphQL query" tooltip={placeholderGraphQLQuery}>
                  <CodeEditor
                    language="graphql"
                    height={'200px'}
                    value={query.url_options?.body_graphql_query || ''}
                    onSave={(e) => onURLOptionsChange('body_graphql_query', e)}
                    onBlur={(e) => onURLOptionsChange('body_graphql_query', e)}
                  />
                </EditorField>
                <br />
                <EditorField label="GraphQL Variables" tooltip={placeholderGraphQLVariables}>
                  <CodeEditor
                    language="json"
                    height={'200px'}
                    value={query.url_options?.body_graphql_variables || placeholderGraphQLVariables}
                    onSave={(e) => onURLOptionsChange('body_graphql_variables', e)}
                    onBlur={(e) => onURLOptionsChange('body_graphql_variables', e)}
                    // onEditorDidMount={(editor, monaco) => {
                    //   monaco.editor.defineTheme('graphqlVariableEditorTheme', {
                    //     base: 'vs-dark',
                    //     inherit: true,
                    //     rules: [{ token: 'grafanaVariable', foreground: '#ff9922', fontStyle: ' italic' }],
                    //     colors: {},
                    //   });
                    //   monaco.editor.setTheme('graphqlVariableEditorTheme');
                    //   monaco.languages.setMonarchTokensProvider('json', {
                    //     tokenizer: {
                    //       root: [
                    //         [
                    //           /@?[a-zA-Z][\w$]*/,
                    //           {
                    //             cases: {
                    //               '@default': 'string',
                    //             },
                    //           },
                    //         ],
                    //         [/[{}()\[\]]/, '@brackets'],
                    //         [/".*?":/, 'variable'],
                    //         [/["|']?\${.*}["|']?/, 'grafanaVariable'],
                    //         [/\d*\.|d+([eE][\-+]?\d+)?/, 'number.float'],
                    //         [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    //         [/\d+/, 'number'],
                    //       ],
                    //     },
                    //   });
                    //   monaco.languages.json.jsonDefaults.setModeConfiguration({
                    //     colors: true,
                    //   });
                    // }}
                  />
                </EditorField>
              </>
            )}
            {(query.url_options?.body_type === 'raw' || !query.url_options?.body_type) && (
              <div style={{ marginRight: '10px' }}>
                <br />
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
                  <Icon name="arrow-down" style={{ marginTop: '10px' }} />
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
                  {...{ placeholder: 'Enter you' }}
                  onSave={(e) => {
                    onURLOptionsChange('data', e);
                    onRunQuery();
                  }}
                  onBlur={(e) => {
                    onURLOptionsChange('data', e);
                    onRunQuery();
                  }}
                />
              </div>
            )}
          </>
        </EditorField>
      </Stack>
    </>
  ) : (
    <></>
  );
};
