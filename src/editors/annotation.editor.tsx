import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { QueryEditor } from './query.editor';
import { Datasource } from './../datasource';
import { InfinityQuery } from './../types';

export const AnnotationsEditor = (props: QueryEditorProps<Datasource, InfinityQuery>) => {
  return (
    <>
      <QueryEditor {...props} hideTip={true} />
    </>
  );
};
