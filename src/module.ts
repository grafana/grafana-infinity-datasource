import { DataSourcePlugin } from '@grafana/data';
import { Datasource } from './datasource';
import { InfinityConfigEditor } from './editors/config.editor';
import { QueryEditor } from './editors/query.editor';
import { VariableEditor } from './editors/variable.editor';

export const plugin = new DataSourcePlugin(Datasource)
  .setConfigEditor(InfinityConfigEditor)
  .setQueryEditor(QueryEditor)
  .setVariableQueryEditor(VariableEditor);
