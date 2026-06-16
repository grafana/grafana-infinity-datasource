import React from 'react';
import { Combobox, type ComboboxOption } from '@grafana/ui';
import { EditorField } from '@/components/extended/EditorField';
import type { InfinityQuery, InfinityQueryType, InfinityParserType } from '@/types';

export const ParseTypeEditor = (props: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  if (query.type === 'json' || query.type === 'graphql' || query.type === 'csv' || query.type === 'tsv' || query.type === 'xml' || query.type === 'html') {
    return (
      <EditorField label="Parser" horizontal={true}>
        <Combobox
          width={22}
          value={query.parser || 'backend'}
          options={getParserOptions(query.type) as any}
          onChange={(e) => {
            if (query.parser === 'uql' && (query.type === 'json' || query.type === 'graphql')) {
              let uql = (query as any).uql || 'parse-json';
              onChange({ ...query, parser: e.value, uql });
            } else if (query.parser === 'uql' && query.type === 'csv') {
              let uql = (query as any).uql || 'parse-csv';
              onChange({ ...query, parser: e.value, uql });
            } else if (query.parser === 'uql' && query.type === 'tsv') {
              let uql = (query as any).uql || 'parse-csv --delimiter "\\t"';
              onChange({ ...query, parser: e.value, uql });
            } else if (query.parser === 'uql' && query.type === 'xml') {
              let uql = (query as any).uql || 'parse-xml';
              onChange({ ...query, parser: e.value, uql });
            } else if (query.parser === 'groq') {
              let groq = query.groq || '*';
              onChange({ ...query, parser: e.value, groq });
            } else {
              onChange({ ...query, parser: e.value });
            }
            onRunQuery();
          }}
        />
      </EditorField>
    );
  }
  return <></>;
};

const getParserOptions = (queryType: InfinityQueryType): Array<ComboboxOption<InfinityParserType>> => {
  switch (queryType) {
    case 'json':
    case 'graphql':
      return [
        { value: 'backend', label: 'JSONata', group: 'Backend' },
        { value: 'jq-backend', label: 'JQ', group: 'Backend' },
        { value: 'uql', label: 'UQL', group: 'Frontend' },
        { value: 'groq', label: 'GROQ', group: 'Frontend' },
        { value: 'simple', label: 'Frontend', group: 'Frontend' },
      ];
    case 'csv':
    case 'tsv':
      return [
        { value: 'backend', label: 'Backend', group: 'Backend' },
        { value: 'uql', label: 'UQL', group: 'Frontend' },
        { value: 'simple', label: 'Frontend', group: 'Frontend' },
      ];
    case 'xml':
      return [
        { value: 'backend', label: 'JSONata', group: 'Backend' },
        { value: 'jq-backend', label: 'JQ', group: 'Backend' },
        { value: 'uql', label: 'UQL', group: 'Frontend' },
        { value: 'simple', label: 'Frontend', group: 'Frontend' },
      ];
    case 'html':
      return [
        { value: 'backend', label: 'JSONata', group: 'Backend' },
        { value: 'jq-backend', label: 'JQ', group: 'Backend' },
        { value: 'simple', label: 'Frontend', group: 'Frontend' },
      ];
    case 'uql':
      return [{ value: 'uql', label: 'UQL', group: 'Frontend' }];
    case 'groq':
      return [{ value: 'groq', label: 'GROQ', group: 'Frontend' }];
    default:
      return [];
  }
};
