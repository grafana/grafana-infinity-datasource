import { DataSourcePlugin } from '@grafana/data';
import { InfinityDatasource } from './datasource';
import { InfinityConfigEditor } from './editors/InfinityConfigEditor';
import { InfinityQueryEditor } from './editors/InfinityQueryEditor';
import { InfinityVariableEditor } from './editors/InfinityVariableEditor';
import { InfinityConfig, InfinitySecureConfig, InfinityQuery } from './types';

export const plugin = new DataSourcePlugin<InfinityDatasource, InfinityQuery, InfinityConfig, InfinitySecureConfig>(InfinityDatasource)
  .setConfigEditor(InfinityConfigEditor)
  .setQueryEditor(InfinityQueryEditor)
  .setVariableQueryEditor(InfinityVariableEditor);
