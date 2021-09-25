import React from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { InfinityConfig } from './../types';
import './../styles/app.scss';

type InfinityConfigEditorProps = {} & DataSourcePluginOptionsEditorProps<InfinityConfig>;

export const InfinityConfigEditor = (props: InfinityConfigEditorProps) => {
  return <div className="infinity-editor config-editor">Infinity Config Editor</div>;
};
