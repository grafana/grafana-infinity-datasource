import React from 'react';
import { defaultsDeep } from 'lodash';
import { QueryEditorProps } from '@grafana/data';
import { Datasource } from './datasource';
import { TypeChooser } from './editors/TypeChooser';
import { AdvancedOptions } from './editors/AdvancedOptions';
import { Scrapper as ScrapperOptions } from './editors/Scrapper';
import { SeriesEditor } from './editors/Series';
import { InfinityQuery } from './types';

interface InfinityEditorProps {
  instanceSettings: any;
  mode: 'standard' | 'global';
  onChange: any;
  query: InfinityQuery;
}

export const InfinityQueryEditor: React.FC<InfinityEditorProps> = ({ query, onChange, mode, instanceSettings }) => {
  query = defaultsDeep(query, {
    type: 'csv',
    source: 'inline',
    format: 'table',
    url: '',
    url_options: {
      method: 'GET',
      data: '',
    },
    data: '',
    root_selector: '',
    columns: [],
  });

  return (
    <div>
      <TypeChooser onChange={onChange} query={query} mode={mode} instanceSettings={instanceSettings} />
      {query.type === 'series' ? <SeriesEditor onChange={onChange} query={query} /> : <></>}
      {['csv', 'html', 'json', 'graphql', 'xml'].indexOf(query.type) > -1 ? (
        <ScrapperOptions onChange={onChange} query={query} />
      ) : (
        <></>
      )}
      {query.type !== 'global' ? <AdvancedOptions onChange={onChange} query={query} /> : <></>}
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
        query={query}
        mode="standard"
        instanceSettings={props.datasource.instanceSettings}
      />
    </div>
  );
};
