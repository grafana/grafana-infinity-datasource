import React from 'react';
import { Select } from '@grafana/ui';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import { CSVOptionsEditor } from './../../components/CSVOptionsEditor';
import { FormatSelector } from './../../components/FormatSelector';
import { GlobalQuerySelector } from './../../components/GlobalQuerySelector';
import { InfinityHelp } from './../../components/Help';
import { JSONOptionsEditor } from './../../components/JSONOptionsEditor';
import { SourceSelector } from './../../components/SourceSelector';
import { TypeSelector } from './../../components/TypeSelector';
import type { EditorMode, InfinityQuery } from './../../types';

export const TypeChooser = (props: { mode: EditorMode; instanceSettings: any; query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, mode, onChange, onRunQuery } = props;
  return (
    <EditorRow>
      <div className="gf-form-inline">
        <div className="gf-form">
          <TypeSelector {...props} />
          {query.type === 'global' && <GlobalQuerySelector {...props} />}
          {query.type !== 'global' && <SourceSelector {...props} />}
          {query.type === 'json' && (
            <EditorField label="Parser">
              <Select<typeof query.parser>
                value={query.parser || 'simple'}
                options={[
                  { value: 'simple', label: 'Default' },
                  { value: 'backend', label: 'Backend' },
                  { value: 'uql', label: 'UQL' },
                  { value: 'groq', label: 'GROQ' },
                ]}
                onChange={(e) => {
                  onChange({ ...query, parser: e.value, uql: query.uql || 'parse-json' });
                  onRunQuery();
                }}
              ></Select>
            </EditorField>
          )}
          {(query.type === 'csv' || query.type === 'tsv' || query.type === 'xml' || query.type === 'graphql') && (
            <EditorField label="Parser">
              <Select<typeof query.parser>
                value={query.parser || 'simple'}
                options={[
                  { value: 'simple', label: 'Default' },
                  { value: 'uql', label: 'UQL' },
                ]}
                onChange={(e) => {
                  let uql = query.uql || '';
                  if (query.type === 'csv' && !query.uql) {
                    uql = `parse-csv`;
                  }
                  if (query.type === 'tsv' && !query.uql) {
                    uql = `parse-csv --delimiter "\t"`;
                  }
                  if (query.type === 'xml' && !query.uql) {
                    uql = `parse-xml`;
                  }
                  if (query.type === 'graphql' && !query.uql) {
                    uql = `parse-json`;
                  }
                  onChange({ ...query, parser: e?.value || 'simple', uql });
                  onRunQuery();
                }}
              ></Select>
            </EditorField>
          )}
          {query.type !== 'series' && mode !== 'variable' && <FormatSelector {...props} />}
          {(query.type === 'csv' || query.type === 'tsv') && <CSVOptionsEditor {...props} />}
          {query.type === 'json' && <JSONOptionsEditor {...props} />}
          <EditorField label="Help">
            <InfinityHelp />
          </EditorField>
        </div>
      </div>
    </EditorRow>
  );
};
