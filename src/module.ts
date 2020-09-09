import { DataSourcePlugin } from '@grafana/data';
import { Datasource } from "./datasource";
import { InfinityConfigEditor } from "./config.editor";
import { InfinityQueryEditor } from "./query.editor";
import { InfinityAnnotationCtrl } from "./annotations.editor";

export const plugin = new DataSourcePlugin(Datasource)
    .setConfigEditor(InfinityConfigEditor)
    .setQueryEditor(InfinityQueryEditor)
    .setAnnotationQueryCtrl(InfinityAnnotationCtrl);
