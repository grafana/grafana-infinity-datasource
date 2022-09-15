import React from 'react';
import { EditorRow } from './../../components/extended/EditorRow';
import { CSVOptionsEditor } from './../../components/CSVOptionsEditor';
import { FormatSelector } from './../../components/FormatSelector';
import { GlobalQuerySelector } from './../../components/GlobalQuerySelector';
import { InfinityHelp } from './../../components/Help';
import { JSONOptionsEditor } from './../../components/JSONOptionsEditor';
import { SourceSelector } from './../../components/SourceSelector';
import { TypeSelector } from './../../components/TypeSelector';
import { ParseTypeEditor } from './components/ParserType';
import type { EditorMode, InfinityQuery } from './../../types';

export const TypeChooser = (props: { mode: EditorMode; instanceSettings: any; query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, mode } = props;
  return (
    <EditorRow>
      <TypeSelector {...props} />
      {query.type !== 'global' ? <SourceSelector {...props} /> : <GlobalQuerySelector {...props} />}
      <ParseTypeEditor {...props} />
      {query.type !== 'series' && mode !== 'variable' && <FormatSelector {...props} />}
      {(query.type === 'csv' || query.type === 'tsv') && <CSVOptionsEditor {...props} />}
      {query.type === 'json' && <JSONOptionsEditor {...props} />}
      <InfinityHelp />
    </EditorRow>
  );
};
