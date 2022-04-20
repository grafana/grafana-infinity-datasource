import React, { useState } from 'react';
import defaultsDeep from 'lodash/defaultsDeep';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { Collapse, LinkButton, InlineFormLabel, Input } from '@grafana/ui';
import { TLSConfigEditor } from './config/TLSConfigEditor';
import { GlobalQueryEditor } from './config/GlobalQueryEditor';
import { SecureFieldsEditor } from '../components/config/SecureFieldsEditor';
import { URLEditor } from './config/URL';
import { AuthEditor } from './config/Auth';
import { ProvisioningScript } from './config/Provisioning';
import { InfinityOptions } from '../types';

export const InfinityConfigEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const [urlOpen, setURLOpen] = useState(false);
  const [tlsOpen, setTlsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [headersOpen, setHeadersOpen] = useState(false);
  const [queriesOpen, setQueriesOpen] = useState(false);
  const [globalsOpen, setGlobalsOpen] = useState(false);
  options.jsonData = defaultsDeep(options.jsonData, {
    global_queries: [],
  });
  const [timeoutInSeconds, setTimeoutInSeconds] = useState(options.jsonData.timeoutInSeconds || 60);
  return (
    <>
      <Collapse label="Authentication" isOpen={authOpen} collapsible={true} onToggle={(e) => setAuthOpen(!authOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <AuthEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      <Collapse label="URL" isOpen={urlOpen} collapsible={true} onToggle={(e) => setURLOpen(!urlOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <URLEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      <Collapse label="Headers" isOpen={headersOpen} collapsible={true} onToggle={(e) => setHeadersOpen(!headersOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <SecureFieldsEditor dataSourceConfig={options} onChange={onOptionsChange} title="Custom HTTP Header" hideTile={true} secureFieldName="httpHeaderName" secureFieldValue="httpHeaderValue" />
        </div>
      </Collapse>
      <Collapse label="URL params" isOpen={queriesOpen} collapsible={true} onToggle={(e) => setQueriesOpen(!queriesOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <SecureFieldsEditor dataSourceConfig={options} onChange={onOptionsChange} title="URL Query Param" hideTile={true} secureFieldName="secureQueryName" secureFieldValue="secureQueryValue" />
        </div>
      </Collapse>
      <Collapse label="TLS/SSL &amp; Network Settings" isOpen={tlsOpen} collapsible={true} onToggle={(e) => setTlsOpen(!tlsOpen)}>
        <div style={{ padding: '1px 10px' }}>
          <div className="gf-form">
            <InlineFormLabel>Timeout in seconds</InlineFormLabel>
            <Input
              css={null}
              value={timeoutInSeconds}
              type="number"
              placeholder="timeout in seconds"
              min={0}
              max={300}
              onChange={(e) => setTimeoutInSeconds(e.currentTarget.valueAsNumber)}
              onBlur={() => {
                props.onOptionsChange({ ...options, jsonData: { ...options.jsonData, timeoutInSeconds } });
              }}
            ></Input>
          </div>
        </div>
        <div style={{ padding: '1px 10px' }}>
          <TLSConfigEditor options={options} onOptionsChange={onOptionsChange} hideTile={true} />
        </div>
      </Collapse>
      <Collapse label="Global Queries" isOpen={globalsOpen} collapsible={true} onToggle={(e) => setGlobalsOpen(!globalsOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <GlobalQueryEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      <Collapse label="More" isOpen={true} collapsible={true}>
        <p style={{ marginInline: '30px', marginBlock: '15px', textAlign: 'center' }}>
          <p>
            <b>Without any additional configuration, this datasource can work.</b> Optionally, configure any of the above settings if you needed.
          </p>
          <LinkButton variant="secondary" size="md" target="_blank" href="https://yesoreyeram.github.io/grafana-infinity-datasource" rel="noreferrer" style={{ marginInlineEnd: '5px' }}>
            Click here plugin documentation website
          </LinkButton>
          <LinkButton variant="secondary" size="md" target="_blank" href="https://github.com/yesoreyeram/grafana-infinity-datasource" rel="noreferrer" style={{ marginInlineEnd: '5px' }}>
            Give us a star in Github
          </LinkButton>
          <ProvisioningScript options={options} />
        </p>
      </Collapse>
    </>
  );
};
