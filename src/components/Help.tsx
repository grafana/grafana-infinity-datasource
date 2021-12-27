import React from 'react';
import { LinkButton } from '@grafana/ui';

export const Help = () => {
  return (
    <LinkButton variant="secondary" size="sm" icon="question-circle" style={{ margin: '5px' }} href="https://yesoreyeram.github.io/grafana-infinity-datasource" target="_blank" rel="noreferrer">
      Open online help
    </LinkButton>
  );
};
