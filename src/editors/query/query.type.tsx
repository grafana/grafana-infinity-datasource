import React from 'react';
import { InfinityQuery, InfinityQueryType, EditorMode } from '../../types';
import { CSVOptionsEditor } from '../../components/app/CSVOptionsEditor';
import { JSONOptionsEditor } from '../../components/app/JSONOptionsEditor';
import { TypeSelector } from '../../components/app/TypeSelector';
import { SourceSelector } from '../../components/app/SourceSelector';
import { FormatSelector } from '../../components/app/FormatSelector';
import { GlobalQuerySelector } from '../../components/app/GlobalQuerySelector';

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
        {query.type === InfinityQueryType.Global ? <GlobalQuerySelector {...props} /> : <SourceSelector {...props} />}
        {query.type !== InfinityQueryType.Series && mode !== EditorMode.Variable && <FormatSelector {...props} />}
        {query.type === InfinityQueryType.CSV && <CSVOptionsEditor {...props} />}
        {query.type === InfinityQueryType.JSON && <JSONOptionsEditor {...props} />}
      </div>
    </div>
  );
};
