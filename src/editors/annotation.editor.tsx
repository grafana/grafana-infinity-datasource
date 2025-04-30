import React from 'react';
import { Datasource } from '@/datasource';
import { QueryEditor } from '@/editors/query.editor';
import type { InfinityQuery } from '@/types';
import type { QueryEditorProps } from '@grafana/data';

export const AnnotationsEditor = (props: QueryEditorProps<Datasource, InfinityQuery>) => {
  return <QueryEditor {...props} />;
};
