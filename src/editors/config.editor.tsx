import React, { useState } from 'react';
import defaultsDeep from 'lodash/defaultsDeep';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { Collapse, InfoBox } from '@grafana/ui';
import { TLSConfigEditor } from './config/TLSConfigEditor';
import { GlobalQueryEditor } from './config/GlobalQueryEditor';
import { SecureFieldsEditor } from './config/SecureFieldsEditor';
import { URLEditor } from './config/URL';
import { AuthEditor } from './config/Auth';
// import { LocalSourcesEditor } from './config/LocalSourcesEditor';
import { InfinityDataSourceJSONOptions } from '../types';

export type Props = DataSourcePluginOptionsEditorProps<InfinityDataSourceJSONOptions>;

export const InfinityConfigEditor: React.FC<Props> = ({ options, onOptionsChange }) => {
  const [urlOpen, setURLOpen] = useState(false);
  const [tlsOpen, setTlsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [headersOpen, setHeadersOpen] = useState(false);
  const [queriesOpen, setQueriesOpen] = useState(false);
  const [globalsOpen, setGlobalsOpen] = useState(false);
  // const [localSourcesOpen, setLocalSourcesOpen] = useState(false);
  options.jsonData = defaultsDeep(options.jsonData, {
    global_queries: [],
  });
  return (
    <>
      <InfoBox>
        <p>
          <b>Without any additional configuration, this datasource can work.</b> Optionally, configure any of the below
          settings.
        </p>
        <a
          className="btn btn-small btn-secondary"
          target="_blank"
          href="https://yesoreyeram.github.io/grafana-infinity-datasource"
        >
          Click here plugin documentation website
        </a>
      </InfoBox>
      <Collapse label="URL" isOpen={urlOpen} collapsible={true} onToggle={e => setURLOpen(!urlOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <URLEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      <Collapse label="Authentication" isOpen={authOpen} collapsible={true} onToggle={e => setAuthOpen(!authOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <AuthEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      <Collapse label="Headers" isOpen={headersOpen} collapsible={true} onToggle={e => setHeadersOpen(!headersOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <SecureFieldsEditor
            dataSourceConfig={options}
            onChange={onOptionsChange}
            title="Custom HTTP Header"
            hideTile={true}
            secureFieldName="httpHeaderName"
            secureFieldValue="httpHeaderValue"
          />
        </div>
      </Collapse>
      <Collapse label="URL params" isOpen={queriesOpen} collapsible={true} onToggle={e => setQueriesOpen(!queriesOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <SecureFieldsEditor
            dataSourceConfig={options}
            onChange={onOptionsChange}
            title="URL Query Param"
            hideTile={true}
            secureFieldName="secureQueryName"
            secureFieldValue="secureQueryValue"
          />
        </div>
      </Collapse>
      <Collapse label="TLS/SSL Settings" isOpen={tlsOpen} collapsible={true} onToggle={e => setTlsOpen(!tlsOpen)}>
        <div style={{ padding: '1px 10px' }}>
          <TLSConfigEditor options={options} onOptionsChange={onOptionsChange} hideTile={true} />
        </div>
      </Collapse>
      <Collapse
        label="Global Queries"
        isOpen={globalsOpen}
        collapsible={true}
        onToggle={e => setGlobalsOpen(!globalsOpen)}
      >
        <div style={{ padding: '0px 10px' }}>
          <GlobalQueryEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      {/* <Collapse
        label="Local Sources"
        isOpen={localSourcesOpen}
        collapsible={true}
        onToggle={e => setLocalSourcesOpen(!localSourcesOpen)}
      >
        <div style={{ padding: '0px 10px' }}>
          <LocalSourcesEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse> */}
    </>
  );
};
