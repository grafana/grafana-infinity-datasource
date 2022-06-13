import React, { useState } from 'react';
import { Select, Button, Drawer, CustomScrollbar, CollapsableSection } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { KeyValueEditor } from './../../components/KeyValuePairEditor';
import { isDataQuery } from './../../app/utils';
import type { InfinityQuery } from '../../types';

export const URLOptionsEditor = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const [popupOpenStatus, setPopupOpenStatus] = useState(false);
  const [body, setBody] = useState((isDataQuery(query) || query.type === 'uql') && query.source === 'url' ? query.url_options.data : '');
  if (!((isDataQuery(query) || query.type === 'uql') && query.source === 'url')) {
    return <></>;
  }
  const btnText = 'HTTP method, Query param, Headers';
  const btnTitle = 'Expand for advanced query options like method, body, etc';
  const placeholderGraphQLQuery = `{\n    query : {\n        # Write your query here\n    }}`;
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
