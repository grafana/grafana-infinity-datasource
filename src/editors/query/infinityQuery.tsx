import React from 'react';
import { defaultsDeep } from 'lodash';
import { TypeChooser } from './query.type';
import { TableFilter } from './query.filters';
import { URLEditor } from './query.url';
import { SeriesEditor } from './query.series';
import { InfinityQuery, EditorMode, InfinityQueryFormat, InfinityQuerySources, InfinityQueryType } from '../../types';

export interface InfinityEditorProps {
  instanceSettings: any;
  mode: EditorMode;
  onChange: any;
  onRunQuery: () => void;
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
  let canShowURL = ['csv', 'html', 'json', 'graphql', 'xml'].indexOf(query.type) > -1;
  let canShowFilterEditor = !['global', 'series'].includes(query.type) && query.columns && query.columns.length > 0;
  return (
    <div>
      {canShowType && <TypeChooser {...{ instanceSettings, mode, query, onChange }} />}
      {canShowSeriesEditor && <SeriesEditor {...{ query, onChange }} />}
      {canShowURL && <URLEditor {...{ mode, query, onChange, onRunQuery }} />}
      {canShowFilterEditor && <TableFilter {...{ query, onChange, onRunQuery }} />}
    </div>
  );
};
