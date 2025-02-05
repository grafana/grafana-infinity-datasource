import React, { useState } from 'react';
import { Input, Stack } from '@grafana/ui';
import { EditorRow } from '../../components/extended/EditorRow';
import { EditorField } from '../../components/extended/EditorField';
import { ComputedColumnsEditor } from './query.computedColumns';
import { isBackendQuery } from 'app/utils';
import type { InfinityQuery } from '../../types';

type ExperimentalFeaturesProps = {
  query: InfinityQuery;
  onChange: (query: InfinityQuery) => void;
  onRunQuery: () => void;
};

export const ExperimentalFeatures = ({ query, onChange, onRunQuery }: ExperimentalFeaturesProps) => {
  if (!isBackendQuery(query)) {
    return <></>;
  }
  return (
    <EditorRow label="Computed columns, Filter, Group by" collapsible={true} collapsed={false} title={() => ''}>
      <Stack gap={1} direction="row" wrap={'wrap'}>
        <ComputedColumnsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} />
        <Filter query={query} onChange={onChange} onRunQuery={onRunQuery} />
        <Summarize query={query} onChange={onChange} onRunQuery={onRunQuery} />
      </Stack>
    </EditorRow>
  );
};

const Filter = ({ query, onChange, onRunQuery }: ExperimentalFeaturesProps) => {
  const [filterExpression, setFilterExpression] = useState(isBackendQuery(query) ? query.filterExpression : '');
  if (isBackendQuery(query)) {
    return (
      <EditorField label="Filter" tooltip={'Filter the results'} optional={true}>
        <Input
          value={filterExpression || ''}
          width={30}
          placeholder={'Example: age >= 18'}
          onChange={(e) => setFilterExpression(e.currentTarget.value)}
          onBlur={(e) => {
            onChange({ ...query, filterExpression });
            onRunQuery();
          }}
        />
      </EditorField>
    );
  }
  return <></>;
};

const Summarize = ({ query, onChange, onRunQuery }: ExperimentalFeaturesProps) => {
  let isValid = true;
  const [summarizeExpression, setSummarizeExpression] = useState(isBackendQuery(query) ? query.summarizeExpression : '');
  const [summarizeBy, setSummarizeBy] = useState(isBackendQuery(query) ? query.summarizeBy : '');
  const [summarizeAlias, setSummarizeAlias] = useState(isBackendQuery(query) ? query.summarizeAlias : '');
  if (!isBackendQuery(query)) {
    return <></>;
  }
  if ((query.type === 'csv' || query.type === 'tsv') && !(query.columns || []).find((c) => c.type === 'number') && query.summarizeExpression) {
    isValid = false;
  }
  return (
    <>
      <Stack direction="column">
        <EditorField invalid={!isValid} label="Summarize" optional={true} tooltip={'Supports basic operations such as min/max/mean/sum/count over numeric fields and count over non numeric fields'}>
          <Input
            value={summarizeExpression || ''}
            width={50}
            placeholder={'Example: sum(salary)'}
            onChange={(e) => setSummarizeExpression(e.currentTarget.value)}
            onBlur={() => {
              onChange({ ...query, summarizeExpression });
              onRunQuery();
            }}
          />
        </EditorField>
        <EditorField label="Summarize By" optional={true} tooltip={'Field name'}>
          <Input
            width={50}
            value={summarizeBy || ''}
            placeholder={'Example: country'}
            onChange={(e) => setSummarizeBy(e.currentTarget.value)}
            onBlur={() => {
              onChange({ ...query, summarizeBy });
              onRunQuery();
            }}
          />
        </EditorField>
        <EditorField label="Summarize Alias" optional={true} tooltip={'Alias'}>
          <Input
            width={50}
            value={summarizeAlias || ''}
            placeholder={'Example: total_salary'}
            onChange={(e) => setSummarizeAlias(e.currentTarget.value)}
            onBlur={() => {
              onChange({ ...query, summarizeAlias });
              onRunQuery();
            }}
          />
        </EditorField>
      </Stack>
    </>
  );
};
