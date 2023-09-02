import React, { useState } from 'react';
import defaultsDeep from 'lodash/defaultsDeep';
import { css } from '@emotion/css';
import { InlineFormLabel, Input, Button, LinkButton, useTheme2, Collapse as CollapseOriginal } from '@grafana/ui';
import { SecureFieldsEditor } from './../components/config/SecureFieldsEditor';
import { AuthEditor } from './config/Auth';
import { AllowedHostsEditor } from './config/AllowedHosts';
import { GlobalQueryEditor } from './config/GlobalQueryEditor';
import { ProvisioningScript } from './config/Provisioning';
import { TLSConfigEditor } from './config/TLSConfigEditor';
import { URLEditor } from './config/URL';
import { OpenAPIEditor } from './config/OpenAPI';
import { ReferenceDataEditor } from './config/ReferenceData';
import { CustomHealthCheckEditor } from './config/CustomHealthCheckEditor';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import type { InfinityOptions } from './../types';

const Collapse = CollapseOriginal as any;

export const MainEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions> & { setActiveTab: React.Dispatch<React.SetStateAction<string>> }) => {
  const { setActiveTab, options } = props;
  const theme = useTheme2();
  return (
    <div
      style={{
        backgroundImage: theme.isDark ? 'url(/public/plugins/yesoreyeram-infinity-datasource/img/homepage-bg.svg)' : '',
        backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : '',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        padding: '30px',
        marginBottom: '30px',
        color: theme.isDark ? '#d9d9d9' : '',
      }}
    >
      <h1>👋 Welcome to Grafana Infinity Data Source!</h1>
      <p style={{ marginBlockStart: 5 }}>
        <b>Without any additional configuration, this datasource can work.</b> Optionally, configure any of the settings you see in the left side such as Authentication if you needed.
      </p>
      <div style={{ marginBlockStart: 5 }}>
        <Button icon="lock" variant="primary" fill="outline" size="md" onClick={() => setActiveTab('auth')} style={{ marginInlineEnd: '5px', color: theme.isDark ? '#d9d9d9' : '' }}>
          Setup Authentication
        </Button>
        <LinkButton
          icon="document-info"
          variant="secondary"
          size="md"
          target="_blank"
          href="https://yesoreyeram.github.io/grafana-infinity-datasource"
          rel="noreferrer"
          style={{ marginInlineEnd: '5px', color: theme.isDark ? '#d9d9d9' : '' }}
        >
          Documentation
        </LinkButton>
        <LinkButton
          icon="star"
          variant="secondary"
          size="md"
          target="_blank"
          href="https://github.com/yesoreyeram/grafana-infinity-datasource"
          rel="noreferrer"
          style={{ marginInlineEnd: '5px', color: theme.isDark ? '#d9d9d9' : '' }}
        >
          Star in Github
        </LinkButton>
        <ProvisioningScript options={options} />
      </div>
    </div>
  );
};

export const HeadersEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  return (
    <>
      <Collapse isOpen={true} collapsible={true} label="Custom HTTP Headers">
        <SecureFieldsEditor dataSourceConfig={options} onChange={onOptionsChange} title="Custom HTTP Header" secureFieldName="httpHeaderName" secureFieldValue="httpHeaderValue" hideTile={true} />
      </Collapse>
      <Collapse isOpen={true} collapsible={true} label="URL Query Param">
        <SecureFieldsEditor dataSourceConfig={options} onChange={onOptionsChange} title="URL Query Param" secureFieldName="secureQueryName" secureFieldValue="secureQueryValue" hideTile={true} />
      </Collapse>
    </>
  );
};

export const NetworkEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const [timeoutInSeconds, setTimeoutInSeconds] = useState(options.jsonData.timeoutInSeconds || 60);
  return (
    <>
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
    </>
  );
};

export const SecurityEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  return (
    <>
      <AllowedHostsEditor options={options} onOptionsChange={onOptionsChange} />
    </>
  );
};

export const ExperimentalEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  return (
    <>
      <OpenAPIEditor options={options} onOptionsChange={onOptionsChange} />
    </>
  );
};

export const MiscEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  return (
    <>
      <URLEditor options={options} onOptionsChange={onOptionsChange} />
    </>
  );
};

const config_sections: Array<{ value: string; label: string; component?: (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => JSX.Element }> = [
  { value: 'main', label: 'Main' },
  { value: 'auth', label: 'Authentication' },
  { value: 'headers_and_params', label: 'Headers & URL params' },
  { value: 'network', label: 'Network' },
  { value: 'security', label: 'Security' },
  { value: 'health_check', label: 'Health check' },
  { value: 'reference_data', label: 'Reference data' },
  { value: 'global_queries', label: 'Global queries' },
  // { value: 'experimental', label: 'Experimental' },
  { value: 'misc', label: 'Misc' },
];

export const InfinityConfigEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const theme = useTheme2();
  const { options, onOptionsChange } = props;
  options.jsonData = defaultsDeep(options.jsonData, { global_queries: [] });
  const [activeTab, setActiveTab] = useState(options.jsonData.auth_method ? 'auth' : 'main');
  const styles = {
    root: css`
      display: flex;
      margin-block-start: -20px;
      margin-block-end: ${theme.spacing('20px')};
      min-height: 300px;
    `,
    tabs: css`
      width: ${theme.spacing('240px')};
    `,
    tab: css`
      position: relative;
      cursor: pointer;
      padding: 8px;
      padding-left: 14px;
      display: block;
      opacity: 0.8;
      &:hover {
        background: ${theme.colors.background.secondary};
        opacity: 1;
      }
    `,
    tab_active: css`
      position: relative;
      cursor: pointer;
      padding: 8px;
      padding-left: 14px;
      display: block;
      background: ${theme.colors.background.secondary};
      opacity: 1;
      &::before {
        display: block;
        content: ' ';
        position: absolute;
        left: 0;
        width: 4px;
        bottom: 2px;
        top: 2px;
        background-image: linear-gradient(0deg, #f05a28 30%, #fbca0a 99%);
      }
    `,
    tabContent: css`
      flex-grow: 1;
      padding-inline-start: ${theme.spacing('20px')};
      border-left: 1px solid ${theme.colors.border.medium};
    `,
  };
  return (
    <>
      <div className={styles.root}>
        <div className={styles.tabs}>
          {config_sections.map((tab) => (
            <div key={tab.value} className={activeTab === tab.value ? styles.tab_active : styles.tab} onClick={() => setActiveTab(tab.value)}>
              {tab.label}
            </div>
          ))}
        </div>
        <div style={{ flexGrow: 1, paddingInlineStart: '20px', borderLeft: `1px solid ${theme.colors.border.medium}` }}>
          {activeTab === 'main' ? (
            <MainEditor options={options} onOptionsChange={onOptionsChange} setActiveTab={setActiveTab} />
          ) : activeTab === 'auth' ? (
            <AuthEditor options={options} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'headers_and_params' ? (
            <HeadersEditor options={options} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'network' ? (
            <NetworkEditor options={options} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'security' ? (
            <SecurityEditor options={options} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'global_queries' ? (
            <GlobalQueryEditor options={options} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'reference_data' ? (
            <ReferenceDataEditor options={options} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'experimental' ? (
            <ExperimentalEditor options={options} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'health_check' ? (
            <CustomHealthCheckEditor options={options} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'misc' ? (
            <MiscEditor options={options} onOptionsChange={onOptionsChange} />
          ) : (
            <AuthEditor options={options} onOptionsChange={onOptionsChange} />
          )}
        </div>
      </div>
    </>
  );
};
