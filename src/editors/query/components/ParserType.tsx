import { css } from '@emotion/css';
import React from 'react';
import { Select, useStyles2 } from '@grafana/ui';
import { EditorField } from './../../../components/extended/EditorField';
import type { GrafanaTheme2 } from '@grafana/data';
import type { InfinityQuery } from './../../../types';

const getStyles = (theme: GrafanaTheme2) => {
  return {
    parserType: {
      promoNode: css({
        marginInlineStart: '5px',
        color: theme.colors.success.border,
      }),
    },
  };
};

export const ParseTypeEditor = (props: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const styles = useStyles2(getStyles);
  const { query, onChange, onRunQuery } = props;
  if (query.type === 'json' || query.type === 'graphql') {
    return (
      <EditorField
        label="Parser"
        tooltip={query.parser !== 'backend' ? 'Try backend parser to get support for alerting, public dashboards, query caching, recorded queries and many more options' : ''}
        horizontal={true}
        promoNode={
          query.parser !== 'backend' && query.parser !== 'uql' ? (
            <span
              className={styles.parserType.promoNode}
              onClick={() => {
                onChange({ ...query, parser: 'backend' });
                onRunQuery();
              }}
            >
              Try backend!
            </span>
          ) : (
            <></>
          )
        }
      >
        <Select<typeof query.parser>
          width={20}
          value={query.parser || 'simple'}
          options={[
            { value: 'simple', label: 'Default' },
            { value: 'backend', label: 'Backend' },
            { value: 'uql', label: 'UQL' },
            { value: 'groq', label: 'GROQ' },
          ]}
          onChange={(e) => {
            if (query.parser === 'uql') {
              let uql = (query as any).uql || 'parse-json';
              onChange({ ...query, parser: e.value, uql });
            } else if (query.parser === 'groq') {
              let groq = query.groq || '*';
              onChange({ ...query, parser: e.value, groq });
            } else {
              onChange({ ...query, parser: e.value });
            }
            onRunQuery();
          }}
        />
      </EditorField>
    );
  }
  if (query.type === 'csv' || query.type === 'tsv') {
    return (
      <EditorField
        label="Parser"
        horizontal={true}
        promoNode={
          query.parser !== 'backend' && query.parser !== 'uql' ? (
            <span
              style={{ marginInline: '5px', color: 'yellowgreen' }}
              onClick={() => {
                onChange({ ...query, parser: 'backend' });
                onRunQuery();
              }}
            >
              Try backend parser!
            </span>
          ) : (
            <></>
          )
        }
      >
        <Select<typeof query.parser>
          width={20}
          value={query.parser || 'simple'}
          options={[
            { value: 'simple', label: 'Default' },
            { value: 'backend', label: 'Backend' },
            { value: 'uql', label: 'UQL' },
          ]}
          onChange={(e) => {
            let uql = (query as any).uql || '';
            if (query.type === 'csv' && !(query as any).uql) {
              uql = `parse-csv`;
            }
            if (query.type === 'tsv' && !(query as any).uql) {
              uql = `parse-csv --delimiter "\t"`;
            }
            onChange({ ...query, parser: e?.value || 'simple', uql });
            onRunQuery();
          }}
        ></Select>
      </EditorField>
    );
  }
  if (query.type === 'xml') {
    return (
      <EditorField
        label="Parser"
        horizontal={true}
        promoNode={
          query.parser !== 'backend' && query.parser !== 'uql' ? (
            <span
              style={{ marginInline: '5px', color: 'yellowgreen' }}
              onClick={() => {
                onChange({ ...query, parser: 'backend' });
                onRunQuery();
              }}
            >
              Try backend parser!
            </span>
          ) : (
            <></>
          )
        }
      >
        <Select<typeof query.parser>
          width={20}
          value={query.parser || 'simple'}
          options={[
            { value: 'simple', label: 'Default' },
            { value: 'backend', label: 'Backend' },
            { value: 'uql', label: 'UQL' },
          ]}
          onChange={(e) => {
            let uql = (query as any).uql || '';
            if (query.type === 'xml' && !(query as any).uql) {
              uql = `parse-xml`;
            }
            onChange({ ...query, parser: e?.value || 'simple', uql });
            onRunQuery();
          }}
        ></Select>
      </EditorField>
    );
  }
  if (query.type === 'html') {
    return (
      <EditorField
        label="Parser"
        horizontal={true}
        promoNode={
          query.parser !== 'backend' ? (
            <span
              style={{ marginInline: '5px', color: 'yellowgreen' }}
              onClick={() => {
                onChange({ ...query, parser: 'backend' });
                onRunQuery();
              }}
            >
              Try backend parser!
            </span>
          ) : (
            <></>
          )
        }
      >
        <Select<typeof query.parser>
          width={20}
          value={query.parser || 'simple'}
          options={[
            { value: 'simple', label: 'Default' },
            { value: 'backend', label: 'Backend' },
          ]}
          onChange={(e) => {
            onChange({ ...query, parser: e?.value || 'simple' });
            onRunQuery();
          }}
        ></Select>
      </EditorField>
    );
  }
  return <></>;
};
