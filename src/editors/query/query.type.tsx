import React from 'react';
import { InfinityQuery, InfinityQueryType, EditorMode } from '../../types';
import { CSVOptionsEditor } from './components/CSVOptionsEditor';
import { JSONOptionsEditor } from './components/JSONOptionsEditor';
import { TypeSelector } from './components/TypeSelector';
import { SourceSelector } from './components/SourceSelector';
import { FormatSelector } from './components/FormatSelector';
import { GlobalQuerySelector } from './components/GlobalQuerySelector';

interface TypeChooserProps {
  mode: EditorMode;
  instanceSettings: any;
  query: InfinityQuery;
  onChange: (value: any) => void;
  onRunQuery: () => void;
}

export const TypeChooser: React.FC<TypeChooserProps> = ({ query, onChange, onRunQuery, mode, instanceSettings }) => {
  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        <TypeSelector query={query} mode={mode} onChange={onChange} onRunQuery={onRunQuery} />
        {query.type === InfinityQueryType.Global ? (
          <GlobalQuerySelector query={query} onChange={onChange} instanceSettings={instanceSettings} />
        ) : (
          <SourceSelector query={query} onChange={onChange} />
        )}
        {query.type !== InfinityQueryType.Series && mode !== EditorMode.Variable && (
          <FormatSelector query={query} onChange={onChange} />
        )}
        {query.type === InfinityQueryType.CSV && (
          <CSVOptionsEditor query={query} onChange={onChange} onRunQuery={onRunQuery}></CSVOptionsEditor>
        )}
        {query.type === InfinityQueryType.JSON && (
          <JSONOptionsEditor query={query} onChange={onChange} onRunQuery={onRunQuery}></JSONOptionsEditor>
        )}
      </div>
    </div>
  );
};
