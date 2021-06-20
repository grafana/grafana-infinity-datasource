import React, { useState } from 'react';
import { set } from 'lodash';
import { css } from 'emotion';
import { Select, Button, Drawer, TabsBar, Tab, CustomScrollbar, TabContent, useTheme, Input } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { InfinityQuery, QueryParam } from '../../types';

interface URLOptionsProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: (value: any) => void;
}

export const URLOptionsEditor: React.FC<URLOptionsProps> = ({ query, onChange, onRunQuery }) => {
  const theme = useTheme();
  const [popupOpenStatus, setPopupOpenStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('method');

  const URL_METHODS: SelectableValue[] = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
  ];

  const onInputTextChange = (value: string, field: string) => {
    set(query, field, value);
    onChange(query);
  };

  const onQueryParamsAdd = () => {
    query.url_options.params = query.url_options.params || [];
    query.url_options.params?.push({
      key: 'key',
      value: 'value',
    });
    onChange(query);
  };

  const onQueryParamDelete = (index: number) => {
    query.url_options.params = query.url_options.params || [];
    query.url_options.params.splice(index, 1);
    onChange(query);
  };

  const onQueryParamItemChange = (index: number, value: string, key: keyof QueryParam) => {
    query.url_options.params = query.url_options.params || [];
    query.url_options.params[index] = { ...query.url_options.params[index], [key]: value };
    onChange(query);
  };

  const onQueryHeadersAdd = () => {
    query.url_options.headers = query.url_options.headers || [];
    query.url_options.headers?.push({
      key: 'header-key',
      value: 'header-value',
    });
    onChange(query);
  };

  const onQueryHeaderDelete = (index: number) => {
    query.url_options.headers = query.url_options.headers || [];
    query.url_options.headers.splice(index, 1);
    onChange(query);
  };

  const onQueryHeaderItemChange = (index: number, value: string, key: keyof QueryParam) => {
    query.url_options.headers = query.url_options.headers || [];
    query.url_options.headers[index] = { ...query.url_options.headers[index], [key]: value };
    onChange(query);
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

  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        {query.type === 'series' ? (
          <></>
        ) : (
          <>
            <Button
              size="sm"
              style={{ marginTop: '5px' }}
              variant="secondary"
              title="Expand for advanced query options like method, body, etc"
              className="btn btn-secondary btn-medium width-2"
              onClick={e => setPopupOpenStatus(true)}
            >
              <i className="fa fa-expand"></i>
            </Button>
            {popupOpenStatus && (
              <>
                <Drawer
                  title={'URL Options'}
                  onClose={() => setPopupOpenStatus(false)}
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
                              onChangeTab={e => {
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
                              <label className="gf-form-label query-keyword width-8">URL</label>
                              <input
                                type="text"
                                className="gf-form-input min-width-30"
                                value={query.url}
                                placeholder="https://jsonplaceholder.typicode.com/todos"
                                onChange={e => onInputTextChange(e.target.value, `url`)}
                                onBlur={onRunQuery}
                              ></input>
                            </div>
                            <div className="gf-form">
                              <label className="gf-form-label query-keyword width-8">Method</label>
                              <Select
                                className="width-8 min-width-8"
                                value={URL_METHODS.find(e => e.value === (query.url_options.method || 'GET'))}
                                defaultValue={URL_METHODS.find(e => e.value === 'GET')}
                                options={URL_METHODS}
                                onChange={e => onInputTextChange(e.value || 'GET', 'url_options.method')}
                              ></Select>
                            </div>
                            {query.url_options.method === 'POST' ? (
                              <div className="gf-form">
                                <label className="gf-form-label query-keyword width-8">Body</label>
                                <textarea
                                  rows={8}
                                  className="gf-form-input min-width-30"
                                  value={query.url_options.data}
                                  placeholder={placeholderGraphQLQuery}
                                  onChange={e => onInputTextChange(e.target.value, `url_options.data`)}
                                ></textarea>
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                          <div className="gf-form-inline">
                            <div
                              className="btn btn-success btn-medium"
                              style={{ marginTop: '5px' }}
                              onClick={e => setPopupOpenStatus(false)}
                            >
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
                                      onChange={e => {
                                        onQueryParamItemChange(index, e.currentTarget.value, 'key');
                                      }}
                                    ></Input>
                                  </td>
                                  <td>
                                    <Input
                                      css={{}}
                                      value={param.value}
                                      onChange={e => {
                                        onQueryParamItemChange(index, e.currentTarget.value, 'value');
                                      }}
                                    ></Input>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-secondary btn-small"
                                      onClick={e => onQueryParamDelete(index)}
                                    >
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
                                      onChange={e => {
                                        onQueryHeaderItemChange(index, e.currentTarget.value, 'key');
                                      }}
                                    ></Input>
                                  </td>
                                  <td>
                                    <Input
                                      css={{}}
                                      value={header.value}
                                      onChange={e => {
                                        onQueryHeaderItemChange(index, e.currentTarget.value, 'value');
                                      }}
                                    ></Input>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-secondary btn-small"
                                      onClick={e => onQueryHeaderDelete(index)}
                                    >
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
                        </>
                      )}
                    </TabContent>
                  </CustomScrollbar>
                </Drawer>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
