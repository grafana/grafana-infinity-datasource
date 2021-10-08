import React from 'react';
import { Button } from '@grafana/ui';

export const Help = () => {
  return (
    <Button
      variant="secondary"
      size="sm"
      icon="question-circle"
      style={{ margin: '5px' }}
      onClick={(e) => {
        e.preventDefault();
        window.open('https://yesoreyeram.github.io/grafana-infinity-datasource', '_blank');
      }}
    >
      Open online help
    </Button>
  );
};
