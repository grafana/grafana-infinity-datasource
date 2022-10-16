import React from 'react';
import { Input } from '@grafana/ui';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import type { InfinityQuery } from './../../types';

type SummarizeProps = {
  query: InfinityQuery;
  onChange: (query: InfinityQuery) => void;
  onRunQuery: () => void;
};

export const Summarize = ({ query, onChange, onRunQuery }: SummarizeProps) => {
  let isValid = true;
  if (!((query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv') && query.parser === 'backend')) {
    return <></>;
  }
  if ((query.type === 'csv' || query.type === 'tsv') && !(query.columns || []).find((c) => c.type === 'number') && query.summarizeExpression) {
    isValid = false;
  }
  return (
    <EditorRow collapsible={true} title={() => 'filter, summarize expression'}>
      <EditorField label="Filter" tooltip={'Experimental support for filter function.'} tag="alpha" optional={true}>
        <Input
          value={query.filterExpression || ''}
          width={60}
          placeholder={'Filter expression goes here. Example: age >= 18'}
          onChange={(e) => onChange({ ...query, filterExpression: e.currentTarget.value })}
          onBlur={onRunQuery}
        />
      </EditorField>
      <EditorField
        invalid={!isValid}
        label="Summarize"
        tooltip={'Experimental support for summarize function. Supports basic operations such as min/max/mean/sum/count over numeric fields'}
        optional={true}
      >
        <Input
          value={query.summarizeExpression || ''}
          width={60}
          placeholder={'Summarize expression goes here. Example: sum(salary)'}
          onChange={(e) => onChange({ ...query, summarizeExpression: e.currentTarget.value })}
          onBlur={onRunQuery}
        />
      </EditorField>
    </EditorRow>
  );
};
