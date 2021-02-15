import React from 'react';
import { defaultsDeep } from 'lodash';
import { QueryEditorProps } from '@grafana/data';
import { Datasource } from './datasource';
import { TypeChooser } from './editors/TypeChooser';
import { TableFilter } from './editors/TableFilters';
import { Scrapper as ScrapperOptions } from './editors/Scrapper';
import { SeriesEditor } from './editors/Series';
import { InfinityQuery, EditorMode, InfinityQueryFormat, InfinityQuerySources, InfinityQueryType } from './types';

interface InfinityEditorProps {
  instanceSettings: any;
  mode: EditorMode;
  onChange: any;
  onRunQuery: any;
  query: InfinityQuery;
}

const defaultQuery: Omit<InfinityQuery, 'refId'> = {
  type: InfinityQueryType.JSON,
  source: InfinityQuerySources.URL,
  format: InfinityQueryFormat.Table,
  url: '',
  url_options: {
    method: 'GET',
    data: '',
  },
  data: '',
  root_selector: '',
  columns: [],
  filters: [],
};
export const InfinityQueryEditor: React.FC<InfinityEditorProps> = ({
  query,
  onChange,
  mode,
  instanceSettings,
  onRunQuery,
}) => {
  query = defaultsDeep(query, defaultQuery);
  let canShowSeriesEditor = query.type === 'series';
  let canShowScrapperOptions = ['csv', 'html', 'json', 'graphql', 'xml'].indexOf(query.type) > -1;
  let canShowFilterEditor = !['global', 'series'].includes(query.type) && query.columns && query.columns.length > 0;
  return (
    <div>
      <TypeChooser onChange={onChange} query={query} mode={mode} instanceSettings={instanceSettings} />
      {canShowSeriesEditor && <SeriesEditor onChange={onChange} query={query} />}
      {canShowScrapperOptions && (
        <ScrapperOptions onChange={onChange} query={query} mode={mode} onRunQuery={onRunQuery} />
      )}
      {canShowFilterEditor && <TableFilter query={query} onChange={onChange} onRunQuery={onRunQuery}></TableFilter>}
    </div>
  );
};

type EditorProps = QueryEditorProps<Datasource, InfinityQuery>;

export const QueryEditor: React.FC<EditorProps> = props => {
  let { query, onChange } = props;
  let default_global_query_id = '';
  if (
    props.datasource.instanceSettings.jsonData.global_queries &&
    props.datasource.instanceSettings.jsonData.global_queries.length > 0
  ) {
    default_global_query_id = props.datasource.instanceSettings.jsonData.global_queries[0].id;
  }
  query = defaultsDeep(query, {
    query_mode: 'standard',
    global_query_id: default_global_query_id,
  });
  return (
    <div>
      <InfinityQueryEditor
        onChange={onChange}
        onRunQuery={props.onRunQuery}
        query={query}
        mode={EditorMode.Standard}
        instanceSettings={props.datasource.instanceSettings}
      />
    </div>
  );
};
