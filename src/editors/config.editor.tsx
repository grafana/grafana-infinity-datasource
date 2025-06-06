import React, { useState } from 'react';
import { defaultsDeep } from 'lodash';
import { css } from '@emotion/css';
import { InlineFormLabel, Input, Button, LinkButton, useTheme2, Collapse as CollapseOriginal, Stack, Grid } from '@grafana/ui';
import { SecureFieldsEditor } from '@/components/config/SecureFieldsEditor';
import { AuthEditor } from '@/editors/config/Auth';
import { ProxyEditor } from '@/editors/config/ProxyEditor';
import { AllowedHostsEditor } from '@/editors/config/AllowedHosts';
import { SecurityConfigEditor } from '@/editors/config/SecurityConfigEditor';
import { GlobalQueryEditor } from '@/editors/config/GlobalQueryEditor';
import { ProvisioningScript } from '@/editors/config/Provisioning';
import { TLSConfigEditor } from '@/editors/config/TLSConfigEditor';
import { URLEditor, URLSettingsEditor } from '@/editors/config/URL';
import { ReferenceDataEditor } from '@/editors/config/ReferenceData';
import { CustomHealthCheckEditor } from '@/editors/config/CustomHealthCheckEditor';
import type { DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';
import type { InfinityOptions } from '@/types';
import { KeepCookiesEditor } from './config/KeepCookies';

const Collapse = CollapseOriginal as any;

export const MainEditor = (
  props: DataSourcePluginOptionsEditorProps<InfinityOptions> & {
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  }
) => {
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
      <Grid minColumnWidth={34} gap={2}>
        <Button icon="lock" variant="primary" fill="solid" size="md" onClick={() => setActiveTab('auth')} style={{ marginInlineEnd: '5px', color: theme.isDark ? '#d9d9d9' : '' }}>
          Setup Authentication
        </Button>
        <LinkButton
          icon="document-info"
          variant="secondary"
          size="md"
          target="_blank"
          href="https://grafana.com/docs/plugins/yesoreyeram-infinity-datasource"
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
          href="https://github.com/grafana/grafana-infinity-datasource"
          rel="noreferrer"
          style={{ marginInlineEnd: '5px', color: theme.isDark ? '#d9d9d9' : '' }}
        >
          Star in Github
        </LinkButton>
        <ProvisioningScript options={options} />
      </Grid>
    </div>
  );
};

export const HeadersEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  return (
    <>
      <Collapse isOpen={true} collapsible={true} label="Base URL">
        <URLEditor options={options} onOptionsChange={onOptionsChange} />
      </Collapse>
      <Collapse isOpen={true} collapsible={true} label="Custom HTTP Headers">
        <SecureFieldsEditor dataSourceConfig={options} onChange={onOptionsChange} title="Custom HTTP Header" secureFieldName="httpHeaderName" secureFieldValue="httpHeaderValue" hideTile={true} />
      </Collapse>
      <Collapse isOpen={true} collapsible={true} label="URL Query Param">
        <SecureFieldsEditor dataSourceConfig={options} onChange={onOptionsChange} title="URL Query Param" secureFieldName="secureQueryName" secureFieldValue="secureQueryValue" hideTile={true} />
      </Collapse>
      <Collapse isOpen={true} collapsible={true} label="URL settings">
        <URLSettingsEditor options={options} onOptionsChange={onOptionsChange} />
      </Collapse>
      <Collapse isOpen={true} collapsible={true} label="Cookies">
        <KeepCookiesEditor options={options} onOptionsChange={onOptionsChange} />
      </Collapse>
    </>
  );
};

export const NetworkEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const [timeoutInSeconds, setTimeoutInSeconds] = useState(options.jsonData.timeoutInSeconds || 60);
  return (
    <>
      <Collapse isOpen={true} collapsible={true} label={'Timeout Settings'}>
        <Stack direction={'row'} gap={0.25}>
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
        </Stack>
      </Collapse>
      <Collapse isOpen={true} collapsible={true} label={'TLS / SSL Settings'}>
        <TLSConfigEditor options={options} onOptionsChange={onOptionsChange} hideTile={true} />
      </Collapse>
      <Collapse isOpen={true} collapsible={true} label={'Proxy Settings'}>
        <ProxyEditor options={options} onOptionsChange={onOptionsChange} />
      </Collapse>
    </>
  );
};

export const SecurityEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  return (
    <>
      <AllowedHostsEditor options={options} onOptionsChange={onOptionsChange} />
      <SecurityConfigEditor options={options} onOptionsChange={onOptionsChange} />
    </>
  );
};

const config_sections: Array<{ value: string; label: string }> = [
  { value: 'main', label: 'Main' },
  { value: 'auth', label: 'Authentication' },
  { value: 'headers_and_params', label: 'URL, Headers & Params' },
  { value: 'network', label: 'Network' },
  { value: 'security', label: 'Security' },
  { value: 'health_check', label: 'Health check' },
  { value: 'reference_data', label: 'Reference data' },
  { value: 'global_queries', label: 'Global queries' },
];

const getOptionsWithDefaults = (options: DataSourceSettings<InfinityOptions>) => {
  return { ...options, jsonData: defaultsDeep(options.jsonData, { global_queries: [] }) };
};

export const InfinityConfigEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const theme = useTheme2();
  const { onOptionsChange } = props;
  const optionsWithDefaults = getOptionsWithDefaults(props.options);
  const [activeTab, setActiveTab] = useState(optionsWithDefaults.jsonData.auth_method ? 'auth' : 'main');
  const styles = {
    root: css`
      display: flex;
      margin-block-start: -20px;
      margin-block-end: ${theme.spacing('20px')};
      min-height: 300px;
    `,
    tabs: css`
      width: ${theme.spacing('200px')};
    `,
    tab: css`
      position: relative;
      cursor: pointer;
      padding: 8px;
      padding-left: 14px;
      display: block;
      width: ${theme.spacing('200px')};
      min-width: ${theme.spacing('200px')};
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
      width: ${theme.spacing('200px')};
      min-width: ${theme.spacing('200px')};
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
          {config_sections.map((tab, tabIndex) => (
            <div
              key={tab.value}
              tabIndex={tabIndex + 1}
              className={activeTab === tab.value ? styles.tab_active : styles.tab}
              onClick={() => setActiveTab(tab.value)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  setActiveTab(tab.value);
                  e.preventDefault();
                }
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
        <div style={{ flexGrow: 1, paddingInlineStart: '20px', borderLeft: `1px solid ${theme.colors.border.medium}` }}>
          {activeTab === 'main' ? (
            <MainEditor options={optionsWithDefaults} onOptionsChange={onOptionsChange} setActiveTab={setActiveTab} />
          ) : activeTab === 'auth' ? (
            <AuthEditor options={optionsWithDefaults} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'headers_and_params' ? (
            <HeadersEditor options={optionsWithDefaults} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'network' ? (
            <NetworkEditor options={optionsWithDefaults} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'security' ? (
            <SecurityEditor options={optionsWithDefaults} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'global_queries' ? (
            <GlobalQueryEditor options={optionsWithDefaults} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'reference_data' ? (
            <ReferenceDataEditor options={optionsWithDefaults} onOptionsChange={onOptionsChange} />
          ) : activeTab === 'health_check' ? (
            <CustomHealthCheckEditor options={optionsWithDefaults} onOptionsChange={onOptionsChange} />
          ) : (
            <AuthEditor options={optionsWithDefaults} onOptionsChange={onOptionsChange} />
          )}
        </div>
      </div>
    </>
  );
};
