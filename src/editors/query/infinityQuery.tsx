import React from 'react';
import { defaultsDeep } from 'lodash';
import { TypeChooser } from './query.type';
import { URLEditor } from './query.url';
import { QueryColumnsEditor } from './query.columns.editor';
import { SeriesEditor } from './query.series';
import { TableFilter } from './query.filters';
import { JSONBackendEditor } from './query.json-backend';
import { UQLEditor } from './query.uql';
import { GROQEditor } from './query.groq';
import { migrateQuery } from './../../migrate';
import { InfinityQuery, EditorMode, DefaultInfinityQuery, InfinityQueryType } from '../../types';

export type InfinityEditorProps = {
  hideTip?: boolean;
  query: InfinityQuery;
  onChange: (query: InfinityQuery) => void;
  onRunQuery: () => void;
  instanceSettings: any;
  mode: EditorMode;
};

export const InfinityQueryEditor = (props: InfinityEditorProps) => {
  const { onChange, mode, instanceSettings, onRunQuery, hideTip } = props;
  let query: InfinityQuery = defaultsDeep(props.query, DefaultInfinityQuery) as InfinityQuery;
  query = migrateQuery(query);
  let canShowURLEditor = ['csv', 'tsv', 'html', 'json', 'json-backend', 'graphql', 'xml', 'uql', 'groq'].includes(query.type);
  let canShowColumnsEditor = ['csv', 'tsv', 'html', 'json', 'json-backend', 'graphql', 'xml'].includes(query.type);
  let canShowFilterEditor =
    query.type !== 'series' && query.type !== 'global' && query.type !== 'json-backend' && query.type !== 'uql' && query.type !== 'groq' && query.columns && query.columns.length > 0;
  return (
    <div className="infinity-query-editor" data-testid="infinity-query-editor">
      <TypeChooser {...{ instanceSettings, mode, query, onChange, onRunQuery }} />
      {query.type === 'series' && <SeriesEditor {...{ query, onChange }} />}
      {canShowURLEditor && <URLEditor {...{ mode, query, onChange, onRunQuery }} />}
      {canShowColumnsEditor && <QueryColumnsEditor {...{ mode, query, onChange, onRunQuery }} />}
      {canShowFilterEditor && <TableFilter {...{ query, onChange, onRunQuery }} />}
      {query.type === 'json-backend' && <JSONBackendEditor {...{ query, onChange, onRunQuery, mode }} />}
      {query.type === 'uql' && <UQLEditor {...{ query, onChange, onRunQuery, mode }} />}
      {query.type === 'groq' && <GROQEditor {...{ query, onChange, onRunQuery, mode }} />}
      {!hideTip && <UQLPromotion queryType={query.type} />}
    </div>
  );
};

const UQLPromotion = ({ queryType }: { queryType: InfinityQueryType }) => {
  return queryType === 'xml' || queryType === 'csv' ? (
    <div>
      <p style={{ paddingBlock: '10px', color: 'yellowgreen' }}>
        💡 You can also use{' '}
        <a href="https://yesoreyeram.github.io/grafana-infinity-datasource/wiki/uql" target="_blank" rel="noreferrer">
          UQL
        </a>{' '}
        query type instead of <b style={{}}>{queryType.toUpperCase()}</b> and get better flexibility and built-in transformations with <b>same data</b> you already have. Give a try!!
      </p>
    </div>
  ) : (
    <></>
  );
};
