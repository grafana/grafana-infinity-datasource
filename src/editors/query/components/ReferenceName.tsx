import React, { useState, useEffect } from 'react';
import { InlineFormLabel, Select } from '@grafana/ui';
import { Datasource } from '@/datasource';
import { isDataQuery } from '@/app/utils';
import { EditorField } from '@/components/extended/EditorField';
import type { InfinityQuery } from '@/types';

export const ReferenceNameEditor = ({
  query,
  onChange,
  onRunQuery,
  datasource,
}: {
  query: InfinityQuery;
  onChange: (value: InfinityQuery) => void;
  onRunQuery: () => void;
  datasource: Datasource;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refNames, setRefNames] = useState<string[]>([]);
  const [lastDatasource, setLastDatasource] = useState(datasource);

  // Reset loading state during render when datasource changes
  if (datasource !== lastDatasource) {
    setLastDatasource(datasource);
    setLoading(true);
    setError('');
    setRefNames([]);
  }

  useEffect(() => {
    let cancelled = false;
    datasource
      .getResource('reference-data')
      .then((res) => {
        if (!cancelled) {
          setRefNames(res);
          setError('');
          setLoading(false);
        }
      })
      .catch((ex) => {
        if (!cancelled) {
          setError(JSON.stringify(ex));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [datasource]);
  if (isDataQuery(query) && query.source === 'reference') {
    return (
      <EditorField label="Reference" horizontal={true} tooltip={'Name of the reference field. Should match with the reference data names defined in the datasource config'}>
        {loading ? (
          <InlineFormLabel width={10}>Loading..</InlineFormLabel>
        ) : error ? (
          <InlineFormLabel width={10}>Error loading ref.</InlineFormLabel>
        ) : refNames.length < 1 ? (
          <InlineFormLabel width={10}>No references found</InlineFormLabel>
        ) : (
          <Select
            width={20}
            value={isDataQuery(query) && query.source === 'reference' ? query.referenceName : ''}
            options={refNames.map((r) => ({ value: r, label: r }))}
            onChange={(e) => {
              onChange({ ...query, referenceName: e.value || '' });
              onRunQuery();
            }}
          />
        )}
      </EditorField>
    );
  }
  return <></>;
};
