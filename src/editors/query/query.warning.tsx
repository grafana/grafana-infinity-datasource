import React from 'react';
import { useLocalStorage } from 'react-use';
import { Alert, Link } from '@grafana/ui';
import type { InfinityQuery } from '@/types';

export const QueryWarning = ({ query }: { query: InfinityQuery }) => {
  const localStorageKey = `grafana-infinity-datasource.parser.${query.type}.${(query as any).parser || 'parser'}.warning`;
  const [dismissed, setDismissed] = useLocalStorage(localStorageKey, false);
  if (
    query.type === 'uql' ||
    query.type === 'groq' ||
    ((query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv' || query.type === 'xml' || query.type === 'html') &&
      query.parser !== 'backend' &&
      query.parser !== 'jq-backend')
  ) {
    const msg = warningMessage(query);
    return !dismissed ? (
      <Alert title={''} severity="warning" topSpacing={1} bottomSpacing={1} onRemove={() => setDismissed(true)}>
        {msg}
      </Alert>
    ) : (
      <></>
    );
  }
  return <></>;
};

const warningMessage = (query: InfinityQuery) => {
  let msg = '';
  if (query.type === 'uql' || query.type === 'groq') {
    msg = query.type.toUpperCase();
  }
  if (
    (query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv' || query.type === 'xml' || query.type === 'html') &&
    query.parser !== 'backend' &&
    query.parser !== 'jq-backend'
  ) {
    msg = query.parser?.toUpperCase() || 'This';
    if (query.parser === 'simple') {
      msg = 'Frontend';
    }
    msg += ` parser`;
  }
  return (
    <>
      {msg} does not support backend operations such as{' '}
      <Link href="https://grafana.com/docs/grafana/latest/alerting/" target="_blank">
        Alerting
      </Link>
      ,{' '}
      <Link href="https://grafana.com/docs/grafana/latest/dashboards/share-dashboards-panels/shared-dashboards/" target="_blank">
        Shared Dashboards
      </Link>
      ,{' '}
      <Link href="https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/sql-expressions/" target="_blank">
        SQL Expressions
      </Link>
      ,{' '}
      <Link href="https://grafana.com/docs/grafana/latest/administration/data-source-management/#query-and-resource-caching" target="_blank">
        Query Caching
      </Link>{' '}
      and{' '}
      <Link href="https://grafana.com/docs/grafana/latest/administration/recorded-queries/" target="_blank">
        Recorded Queries
      </Link>
      . Consider using JSONata / JQ based backend parsers instead.
    </>
  );
};
