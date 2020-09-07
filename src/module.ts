import { DataSourcePlugin } from '@grafana/data';
import { Datasource } from "./datasource";
import { UtilsConfigEditor } from "./config.editor";
import { UtilsQueryEditor } from "./query.editor";
import { UtilsAnnotationCtrl } from "./annotations.editor";

export const plugin = new DataSourcePlugin(Datasource)
    .setConfigEditor(UtilsConfigEditor)
    .setQueryEditor(UtilsQueryEditor)
    .setAnnotationQueryCtrl(UtilsAnnotationCtrl);
