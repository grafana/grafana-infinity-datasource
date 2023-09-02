import { Button, Modal, useTheme2 } from '@grafana/ui';
import React, { useState } from 'react';
import type { InfinityOptions } from './../../types';
import type { DataSourceSettings } from '@grafana/data';
const YAML = require('json-to-pretty-yaml');

export const ProvisioningScript = (props: { options: DataSourceSettings<InfinityOptions, {}> }) => {
  const { options } = props;
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme2();
  const getYaml = (): string => {
    try {
      let { version, secureJsonFields, database, user, password, basicAuthPassword, withCredentials, access, typeLogoUrl, accessControl, ...newOptions }: Record<string, any> = { ...options };
      newOptions.secureJsonData = {};
      Object.keys(options?.secureJsonFields || {}).forEach((secret) => {
        newOptions.secureJsonData[secret] = 'xxxxxxx';
      });
      if (Object.keys(options?.secureJsonFields || {}).length === 0) {
        delete newOptions.secureJsonData;
      }
      delete newOptions.secureJsonFields;
      const data: string = YAML.stringify({ apiVersion: 1, datasources: [newOptions] });
      return typeof data === 'string' ? data : 'oops.. error getting provisioning yaml';
    } catch (ex) {
      console.error(ex);
      return 'oops.. error getting provisioning yaml';
    }
  };
  return (
    <>
      <Button
        icon="book"
        variant="secondary"
        size="md"
        style={{ marginInlineEnd: '5px', color: theme.isDark ? '#d9d9d9' : '' }}
        onClick={(e) => {
          setIsOpen(true);
          e.preventDefault();
        }}
      >
        Provisioning Script
      </Button>
      <Modal title="Provisioning Script" isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
        <p>
          You can also use the following yaml configuration to provision this datasource instance. You can read more about provisioning{' '}
          <u>
            <a href="https://grafana.com/docs/grafana/latest/administration/provisioning/" target="_blank" rel="noreferrer">
              here
            </a>
          </u>
          .
        </p>
        <pre>{getYaml()}</pre>
      </Modal>
    </>
  );
};
