import React from 'react';
import { CSVOptionsEditor } from './../../components/CSVOptionsEditor';
import { FormatSelector } from './../../components/FormatSelector';
import { GlobalQuerySelector } from './../../components/GlobalQuerySelector';
import { InfinityHelp } from './../../components/Help';
import { JSONOptionsEditor } from './../../components/JSONOptionsEditor';
import { SourceSelector } from './../../components/SourceSelector';
import { TypeSelector } from './../../components/TypeSelector';
import type { EditorMode, InfinityQuery } from './../../types';

export const TypeChooser = (props: { mode: EditorMode; instanceSettings: any; query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, mode } = props;
  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        <TypeSelector {...props} />
        {query.type === 'global' ? <GlobalQuerySelector {...props} /> : <SourceSelector {...props} />}
        {query.type !== 'series' && mode !== 'variable' && <FormatSelector {...props} />}
        {(query.type === 'csv' || query.type === 'tsv') && <CSVOptionsEditor {...props} />}
        {query.type === 'json' && <JSONOptionsEditor {...props} />}
        <InfinityHelp />
      </div>
    </div>
  );
};
