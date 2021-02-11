import { DataSourcePlugin } from '@grafana/data';
import { Datasource } from './datasource';
import { InfinityConfigEditor } from './config.editor';
import { QueryEditor } from './query.editor';
import { VariableEditor } from './variable.editor';
import { InfinityAnnotationCtrl } from './annotations.editor';

export const plugin = new DataSourcePlugin(Datasource)
  .setConfigEditor(InfinityConfigEditor)
  .setQueryEditor(QueryEditor)
  .setVariableQueryEditor(VariableEditor)
  .setAnnotationQueryCtrl(InfinityAnnotationCtrl);
