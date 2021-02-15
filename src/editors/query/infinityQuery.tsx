import React from 'react';
import { defaultsDeep } from 'lodash';
import { TypeChooser } from './query.type';
import { TableFilter } from './query.filters';
import { URLEditor } from './query.url';
import { SeriesEditor } from './query.series';
import { InfinityQuery, EditorMode, InfinityQueryFormat, InfinityQuerySources, InfinityQueryType } from '../../types';

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
  let canShowType = true;
  let canShowSeriesEditor = query.type === 'series';
  let canShowScrapperOptions = ['csv', 'html', 'json', 'graphql', 'xml'].indexOf(query.type) > -1;
  let canShowFilterEditor = !['global', 'series'].includes(query.type) && query.columns && query.columns.length > 0;
  return (
    <div>
      {canShowType && <TypeChooser onChange={onChange} query={query} mode={mode} instanceSettings={instanceSettings} />}
      {canShowSeriesEditor && <SeriesEditor onChange={onChange} query={query} />}
      {canShowScrapperOptions && <URLEditor onChange={onChange} query={query} mode={mode} onRunQuery={onRunQuery} />}
      {canShowFilterEditor && <TableFilter query={query} onChange={onChange} onRunQuery={onRunQuery}></TableFilter>}
    </div>
  );
};
