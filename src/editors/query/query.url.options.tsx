import React, { useState } from 'react';
import { cloneDeep } from 'lodash';
import { css } from 'emotion';
import { Select, Button, Drawer, TabsBar, Tab, CustomScrollbar, TabContent, useTheme, Input } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { isDataQuery } from './../../app/utils';
import { InfinityQuery, QueryParam } from '../../types';

export const URLOptionsEditor = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const theme = useTheme();
  const [popupOpenStatus, setPopupOpenStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('method');
  const [body, setBody] = useState((isDataQuery(query) || query.type === 'uql') && query.source === 'url' ? query.url_options.data : '');
  if (!((isDataQuery(query) || query.type === 'uql') && query.source === 'url')) {
    return <></>;
  }
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
  const onQueryParamsAdd = () => {
    const params = cloneDeep(query.source === 'url' ? query.url_options.params : []) || [];
    params.push(defaultParam);
    onChange({
      ...query,
      url_options: {
        ...query.url_options,
        params,
      },
    });
  };
  const onQueryParamDelete = (index: number) => {
    const params = cloneDeep(query.url_options.params || []);
    params.splice(index, 1);
    onChange({
      ...query,
      url_options: {
        ...query.url_options,
        params,
      },
    });
  };
  const onQueryParamItemChange = (index: number, value: string, key: keyof QueryParam) => {
    const params = cloneDeep(query.url_options.params || []);
    params[index] = { ...params[index], [key]: value };
    onChange({
      ...query,
      url_options: {
        ...query.url_options,
        params,
      },
    });
  };
  const onQueryHeadersAdd = () => {
    const headers = cloneDeep(query.url_options.headers || []);
    headers.push(defaultHeader);
    onChange({
      ...query,
      url_options: {
        ...query.url_options,
        headers,
      },
    });
  };
  const onQueryHeaderDelete = (index: number) => {
    const headers = cloneDeep(query.url_options.headers || []);
    headers.splice(index, 1);
    onChange({
      ...query,
      url_options: {
        ...query.url_options,
        headers,
      },
    });
  };
  const onQueryHeaderItemChange = (index: number, value: string, key: keyof QueryParam) => {
    const headers = cloneDeep(query.url_options.headers || []);
    headers[index] = { ...headers[index], [key]: value };
    onChange({
      ...query,
      url_options: {
        ...query.url_options,
        headers,
      },
    });
  };
  const tabs: Array<SelectableValue<string>> = [
    {
      label: 'Method & Body',
      value: 'method',
    },
    {
      label: 'Query Params',
      value: 'params',
    },
    {
      label: 'Headers',
      value: 'headers',
    },
  ];

  const placeholderGraphQLQuery = `{
    query : {
        # Write your query here
    }
}`;

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

  const onBodyChange = () => {
    onChange({
      ...query,
      url_options: {
        ...query.url_options,
        data: body,
      },
    });
    onRunQuery();
  };

  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        <Button
          size="sm"
          icon="shield"
          name="More settings"
          style={{ marginTop: '5px' }}
          variant="secondary"
          title="Expand for advanced query options like method, body, etc"
          onClick={(e) => {
            setPopupOpenStatus(!popupOpenStatus);
            e.preventDefault();
          }}
        >
          HTTP method, Query param, Headers
        </Button>
        {popupOpenStatus && (
          <>
            <Drawer
              title={'URL Options'}
              onClose={() => setPopupOpenStatus(!popupOpenStatus)}
              expandable
              width="50%"
              subtitle={
                <div style={{ paddingLeft: '0px', marginLeft: '0px' }}>
                  <div className="muted">
                    {query.url}
                    &nbsp;<i className="fa fa-refresh mx-2" onClick={onRunQuery}></i>
                  </div>
                  <TabsBar
                    className={css`
                      padding-left: ${theme.spacing.md};
                      margin: ${theme.spacing.lg} -${theme.spacing.sm} -${theme.spacing.lg} -${theme.spacing.lg};
                    `}
                  >
                    {tabs.map((t, index) => {
                      return (
                        <Tab
                          css={{}}
                          key={`${t.value}-${index}`}
                          label={t.label + ''}
                          active={t.value === activeTab}
                          onChangeTab={(e) => {
                            setActiveTab(t.value + '');
                          }}
                        />
                      );
                    })}
                  </TabsBar>
                </div>
              }
            >
              <CustomScrollbar autoHeightMin="100%">
                <TabContent
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {activeTab === 'method' && (
                    <>
                      <div className="gf-form-inline">
                        <div className="gf-form">
                          <label className="gf-form-label query-keyword width-8">Method</label>
                          <Select
                            className="width-8 min-width-8"
                            value={URL_METHODS.find((e) => e.value === (query.url_options.method || 'GET'))}
                            defaultValue={URL_METHODS.find((e) => e.value === 'GET')}
                            options={URL_METHODS}
                            onChange={(e) => onMethodChange(e.value)}
                          ></Select>
                        </div>
                        {query.url_options.method === 'POST' ? (
                          <div className="gf-form">
                            <label className="gf-form-label query-keyword width-8">Body</label>
                            <textarea
                              rows={8}
                              className="gf-form-input min-width-30"
                              value={body}
                              placeholder={placeholderGraphQLQuery}
                              onChange={(e) => setBody(e.currentTarget.value)}
                              onBlur={() => onBodyChange()}
                            ></textarea>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="gf-form-inline">
                        <div className="btn btn-success btn-medium" style={{ marginTop: '5px' }} onClick={(e) => setPopupOpenStatus(false)}>
                          OK
                        </div>
                        <br />
                        <br />
                        <br />
                        <br />
                      </div>
                    </>
                  )}
                  {activeTab === 'params' && (
                    <>
                      <table
                        style={{
                          width: '100%',
                        }}
                      >
                        {query.url_options.params && query.url_options.params.length > 0 && (
                          <thead>
                            <td width="40%">Param key</td>
                            <td width="40%">Param value</td>
                            <td width="20%"></td>
                          </thead>
                        )}
                        {query.url_options.params &&
                          query.url_options.params.map((param, index) => (
                            <tr key={index}>
                              <td>
                                <Input
                                  css={{}}
                                  value={param.key}
                                  onChange={(e) => {
                                    onQueryParamItemChange(index, e.currentTarget.value, 'key');
                                  }}
                                ></Input>
                              </td>
                              <td>
                                <Input
                                  css={{}}
                                  value={param.value}
                                  onChange={(e) => {
                                    onQueryParamItemChange(index, e.currentTarget.value, 'value');
                                  }}
                                ></Input>
                              </td>
                              <td>
                                <button className="btn btn-secondary btn-small" onClick={(e) => onQueryParamDelete(index)}>
                                  <i className="fa fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </table>
                      <br />
                      <button className="btn btn-success" onClick={onQueryParamsAdd}>
                        Add Query Param
                      </button>
                    </>
                  )}
                  {activeTab === 'headers' && (
                    <>
                      <table
                        style={{
                          width: '100%',
                        }}
                      >
                        {query.url_options.headers && query.url_options.headers.length > 0 && (
                          <thead>
                            <td width="40%">Header Name</td>
                            <td width="40%">Header Value</td>
                            <td width="20%"></td>
                          </thead>
                        )}
                        {query.url_options.headers &&
                          query.url_options.headers.map((header, index) => (
                            <tr key={index}>
                              <td>
                                <Input
                                  css={{}}
                                  value={header.key}
                                  onChange={(e) => {
                                    onQueryHeaderItemChange(index, e.currentTarget.value, 'key');
                                  }}
                                ></Input>
                              </td>
                              <td>
                                <Input
                                  css={{}}
                                  value={header.value}
                                  onChange={(e) => {
                                    onQueryHeaderItemChange(index, e.currentTarget.value, 'value');
                                  }}
                                ></Input>
                              </td>
                              <td>
                                <button className="btn btn-secondary btn-small" onClick={(e) => onQueryHeaderDelete(index)}>
                                  <i className="fa fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </table>
                      <br />
                      <button className="btn btn-success" onClick={onQueryHeadersAdd}>
                        Add Custom Header
                      </button>
                      <div style={{ padding: '20px 10px', marginTop: '20px', border: '1px solid gray' }}>
                        <h4>Note : If you have any secrets to be added as header, use the datasource config instead.</h4>
                      </div>
                    </>
                  )}
                </TabContent>
              </CustomScrollbar>
            </Drawer>
          </>
        )}
      </div>
    </div>
  );
};
