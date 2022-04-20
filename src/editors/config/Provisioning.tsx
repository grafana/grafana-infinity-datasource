import React, { useState } from 'react';
import { Button, Modal } from '@grafana/ui';
import { DataSourceSettings } from '@grafana/data';
const YAML = require('json-to-pretty-yaml');
import { InfinityOptions } from './../../types';

export const ProvisioningScript = (props: { options: DataSourceSettings<InfinityOptions, {}> }) => {
  const { options } = props;
  const [isOpen, setIsOpen] = useState(false);
  const getYaml = () => {
    let { secureJsonFields, database, user, password, basicAuthPassword, withCredentials, access, typeLogoUrl, ...newOptions }: Record<string, any> = { ...options };
    newOptions.secureJsonData = {};
    Object.keys(options?.secureJsonFields || {}).forEach((secret) => {
      newOptions.secureJsonData[secret] = 'xxxxxxx';
    });
    if (Object.keys(options?.secureJsonFields || {}).length === 0) {
      delete newOptions.secureJsonData;
    }
    delete newOptions.secureJsonFields;
    const data = YAML.stringify({ apiVersion: 1, datasources: [newOptions] });
    return data;
  };
  return (
    <>
      <Button
        variant="secondary"
        size="md"
        style={{ marginInlineEnd: '5px' }}
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
