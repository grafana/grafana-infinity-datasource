import React, { useEffect, useState } from 'react';
import { Select } from '@grafana/ui';
import { Stack } from '../../components/extended/Stack';
import { EditorRow } from '../../components/extended/EditorRow';
import { isDataQuery, fetchDatasets } from './../../app/utils';
import type { InfinityQuery } from './../../types';
import { EditorField } from 'components/extended/EditorField';

type UnistoreEditorProps = { query: InfinityQuery; onChange: (query: InfinityQuery) => void; onRunQuery: () => void };

export const UnistoreEditor = (props: UnistoreEditorProps) => {
  const { query, onChange, onRunQuery } = props;
  const [datasetOptions, setDatasetOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const datasets = await fetchDatasets(query.type);
      setDatasetOptions(datasets);
    };
    fetchData();
  }, [query.type]);

  if ((isDataQuery(query) || query.type === 'series') && query.source === 'unistore') {
    return (
      <EditorRow label="Unistore details" collapsible={false} collapsed={true} title={() => ''}>
        <Stack gap={1} direction="row" wrap={true}>
          <EditorField label="Dataset" horizontal={true}>
            <Select
              value={query.dataset}
              options={datasetOptions.map((dataset) => ({ value: dataset, label: dataset }))}
              onChange={(e) => {
                onChange({ ...query, dataset: e.value! });
                onRunQuery();
              }}
            />
          </EditorField>
        </Stack>
      </EditorRow>
    );
  }
  return <></>;
};
