import React from 'react';
import { Combobox } from '@grafana/ui';
import { EditorField } from '@/components/extended/EditorField';
import type { SelectableValue } from '@grafana/data';
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

const getParserOptions = (queryType: InfinityQueryType): Array<SelectableValue<InfinityParserType>> => {
  switch (queryType) {
    case 'json':
    case 'graphql':
      return [
        {
          label: 'Backend',
          options: [
            { value: 'backend', label: 'JSONata' },
            { value: 'jq-backend', label: 'JQ' },
          ],
        },
        {
          label: 'Frontend',
          options: [
            { value: 'uql', label: 'UQL' },
            { value: 'groq', label: 'GROQ' },
            { value: 'simple', label: 'Frontend' },
          ],
        },
      ];
    case 'csv':
    case 'tsv':
      return [
        {
          label: 'Backend',
          options: [{ value: 'backend', label: 'Backend' }],
        },
        {
          label: 'Frontend',
          options: [
            { value: 'uql', label: 'UQL' },
            { value: 'simple', label: 'Frontend' },
          ],
        },
      ];
    case 'xml':
      return [
        {
          label: 'Backend',
          options: [
            { value: 'backend', label: 'JSONata' },
            { value: 'jq-backend', label: 'JQ' },
          ],
        },
        {
          label: 'Frontend',
          options: [
            { value: 'uql', label: 'UQL' },
            { value: 'simple', label: 'Frontend' },
          ],
        },
      ];
    case 'html':
      return [
        {
          label: 'Backend',
          options: [
            { value: 'backend', label: 'JSONata' },
            { value: 'jq-backend', label: 'JQ' },
          ],
        },
        {
          label: 'Frontend',
          options: [{ value: 'simple', label: 'Frontend' }],
        },
      ];
    case 'uql':
      return [
        {
          label: 'Frontend',
          options: [{ value: 'uql', label: 'UQL' }],
        },
      ];
    case 'groq':
      return [
        {
          label: 'Frontend',
          options: [{ value: 'groq', label: 'GROQ' }],
        },
      ];
    default:
      return [];
  }
};
