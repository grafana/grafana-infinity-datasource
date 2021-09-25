import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { InfinityDatasource } from '../datasource';
import { InfinityConfig, InfinityQuery } from '../types';
import './../styles/app.scss';

type InfinityQueryEditorProps = {} & QueryEditorProps<InfinityDatasource, InfinityQuery, InfinityConfig>;

export const InfinityQueryEditor = (props: InfinityQueryEditorProps) => {
  return <div className="infinity-editor query-editor">Infinity Query Editor</div>;
};
