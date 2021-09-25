import React from 'react';
import { InfinityDatasource } from './../datasource';
import { InfinityVariableQuery } from './../types';
import './../styles/app.scss';

type InfinityVariableEditorProps = {
  query: InfinityVariableQuery;
  datasource: InfinityDatasource;
  onChange: (query: InfinityVariableQuery, definition: string) => void;
};

export const InfinityVariableEditor = (props: InfinityVariableEditorProps) => {
  return <div className="infinity-editor variable-editor">Infinity Variable Editor</div>;
};
