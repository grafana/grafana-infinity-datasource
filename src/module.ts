import { DataSourcePlugin } from '@grafana/data';
import { Datasource } from "./datasource";
import { ScrappingConfigEditor } from "./config.editor";
import { ScrapingQueryEditor } from "./query.editor";
import { ScrapingAnnotationCtrl } from "./annotations.editor";

export const plugin = new DataSourcePlugin(Datasource)
    .setConfigEditor(ScrappingConfigEditor)
    .setQueryEditor(ScrapingQueryEditor)
    .setAnnotationQueryCtrl(ScrapingAnnotationCtrl);
