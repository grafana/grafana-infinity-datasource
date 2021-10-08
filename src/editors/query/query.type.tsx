import React from 'react';
import { InfinityQuery, EditorMode } from '../../types';
import { CSVOptionsEditor } from '../../components/CSVOptionsEditor';
import { JSONOptionsEditor } from '../../components/JSONOptionsEditor';
import { TypeSelector } from '../../components/TypeSelector';
import { SourceSelector } from '../../components/SourceSelector';
import { FormatSelector } from '../../components/FormatSelector';
import { GlobalQuerySelector } from '../../components/GlobalQuerySelector';
import { Help } from '../../components/Help';

interface TypeChooserProps {
  mode: EditorMode;
  instanceSettings: any;
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: () => void;
}

export const TypeChooser = (props: TypeChooserProps) => {
  const { query, mode } = props;
  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        <TypeSelector {...props} />
        {query.type === 'global' ? <GlobalQuerySelector {...props} /> : <SourceSelector {...props} />}
        {query.type !== 'series' && mode !== 'variable' && <FormatSelector {...props} />}
        {query.type === 'csv' && <CSVOptionsEditor {...props} />}
        {query.type === 'json' && <JSONOptionsEditor {...props} />}
        <Help />
      </div>
    </div>
  );
};
