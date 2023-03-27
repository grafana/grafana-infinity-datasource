import { Collapse as CollapseOriginal, InlineFormLabel, Input, LinkButton } from '@grafana/ui';
import defaultsDeep from 'lodash/defaultsDeep';
import React, { useState } from 'react';
import { SecureFieldsEditor } from './../components/config/SecureFieldsEditor';
import { AuthEditor } from './config/Auth';
import { GlobalQueryEditor } from './config/GlobalQueryEditor';
import { ProvisioningScript } from './config/Provisioning';
import { TLSConfigEditor } from './config/TLSConfigEditor';
import { URLEditor } from './config/URL';
import { OpenAPIEditor } from './config/OpenAPI';
import { ReferenceDataEditor } from './config/ReferenceData';
import type { InfinityOptions } from './../types';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data/types';

const Collapse = CollapseOriginal as any;

export const InfinityConfigEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const [miscOpen, setMiscOpen] = useState(false);
  const [tlsOpen, setTlsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(true);
  const [headersOpen, setHeadersOpen] = useState(false);
  const [queriesOpen, setQueriesOpen] = useState(false);
  const [globalsOpen, setGlobalsOpen] = useState(false);
  const [referenceDataOpen, setReferenceDataOpen] = useState(false);
  const [experimentalOpen, setExperimentalOpen] = useState(false);
  options.jsonData = defaultsDeep(options.jsonData, {
    global_queries: [],
  });
  const [timeoutInSeconds, setTimeoutInSeconds] = useState(options.jsonData.timeoutInSeconds || 60);
  return (
    <>
      <Collapse label="Authentication" isOpen={authOpen} collapsible={true} onToggle={() => setAuthOpen(!authOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <AuthEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      <Collapse label="Headers" isOpen={headersOpen} collapsible={true} onToggle={() => setHeadersOpen(!headersOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <SecureFieldsEditor dataSourceConfig={options} onChange={onOptionsChange} title="Custom HTTP Header" hideTile={true} secureFieldName="httpHeaderName" secureFieldValue="httpHeaderValue" />
        </div>
      </Collapse>
      <Collapse label="URL params" isOpen={queriesOpen} collapsible={true} onToggle={() => setQueriesOpen(!queriesOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <SecureFieldsEditor dataSourceConfig={options} onChange={onOptionsChange} title="URL Query Param" hideTile={true} secureFieldName="secureQueryName" secureFieldValue="secureQueryValue" />
        </div>
      </Collapse>
      <Collapse label="TLS/SSL &amp; Network Settings" isOpen={tlsOpen} collapsible={true} onToggle={() => setTlsOpen(!tlsOpen)}>
        <div style={{ padding: '1px 10px' }}>
          <div className="gf-form">
            <InlineFormLabel>Timeout in seconds</InlineFormLabel>
            <Input
              value={timeoutInSeconds}
              type="number"
              placeholder="timeout in seconds"
              min={0}
              max={300}
              onChange={(e: any) => setTimeoutInSeconds(e.currentTarget.valueAsNumber)}
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
      <Collapse label="Global Queries" isOpen={globalsOpen} collapsible={true} onToggle={() => setGlobalsOpen(!globalsOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <GlobalQueryEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      <Collapse label="Misc" isOpen={miscOpen} collapsible={true} onToggle={() => setMiscOpen(!miscOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <URLEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      <Collapse label="Reference Data" isOpen={referenceDataOpen} collapsible={true} onToggle={() => setReferenceDataOpen(!referenceDataOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <ReferenceDataEditor options={options} onOptionsChange={onOptionsChange} />
        </div>
      </Collapse>
      <Collapse label="Experimental" isOpen={experimentalOpen} collapsible={true} onToggle={() => setExperimentalOpen(!experimentalOpen)}>
        <div style={{ padding: '0px 10px' }}>
          <OpenAPIEditor options={options} onOptionsChange={onOptionsChange} />
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
