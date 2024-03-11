import React, { useState, useEffect } from 'react';
import { InlineFormLabel, Select } from '@grafana/ui';
import { Datasource } from './../../../datasource';
import { isDataQuery } from './../../../app/utils';
import { EditorField } from './../../../components/extended/EditorField';
import type { InfinityQuery } from './../../../types';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refNames, setRefNames] = useState<string[]>([]);
  useEffect(() => {
    setLoading(true);
    setError('');
    datasource
      .getResource('reference-data')
      .then((res) => {
        setRefNames(res);
        setError('');
      })
      .catch((ex) => {
        setError(JSON.stringify(ex));
      })
      .finally(() => {
        setLoading(false);
      });
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
