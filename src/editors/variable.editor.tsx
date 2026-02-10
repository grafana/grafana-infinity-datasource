import React, { useEffect, useState } from 'react';
import { DataFrame, SelectableValue, type DataQueryRequest } from '@grafana/data';
import { TagsInput, TextArea, RadioButtonGroup, Field, Combobox, type ComboboxOption } from '@grafana/ui';
import { EditorRows, EditorRow } from '@/components/extended/EditorRow';
import { EditorField } from '@/components/extended/EditorField';
import { migrateLegacyQuery } from '@/app/variablesQuery';
import { variableQueryTypes } from '@/constants';
import { Datasource } from '@/datasource';
import { InfinityQueryEditor } from '@/editors/query/infinityQuery';
import type { InfinityQuery, VariableMeta, VariableQuery, VariableQueryInfinity, VariableQueryLegacy, VariableQueryRandom, VariableQueryType } from '@/types';

type Props = { query: VariableQuery; onChange: (query: VariableQuery, definition: string) => void; datasource: Datasource };

export const VariableEditor = (props: Props) => {
  const query = migrateLegacyQuery(props.query);
  const onQueryTypeChange = (queryType: VariableQueryType) => {
    const newQuery: VariableQuery = { ...query, queryType } as VariableQuery;
    props.onChange(newQuery, `${props.datasource.name}- (${newQuery.queryType}) ${newQuery.queryType === 'legacy' ? newQuery.query : ''}`);
  };
  return (
    <>
      <Field label="Query Type">
        <RadioButtonGroup<VariableQueryType> options={variableQueryTypes} value={query.queryType} onChange={(v) => onQueryTypeChange(v)}></RadioButtonGroup>
      </Field>
      {query.queryType === 'infinity' && query.infinityQuery && <VariableEditorInfinity {...props} query={query} />}
      {query.queryType === 'legacy' && <VariableEditorLegacy {...props} query={query} />}
      {query.queryType === 'random' && <VariableEditorRandom {...props} query={query} />}
      {query.queryType === 'infinity' && <FieldMapping {...props} />}
    </>
  );
};

const FieldMapping = (props: Props) => {
  const { query, datasource } = props;
  const [choices, setChoices] = useState<SelectableValue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (query.queryType !== 'infinity' || !query.infinityQuery) {
      setChoices([]);
      setIsLoading(false);
      return;
    }
    let isActive = true;
    setIsLoading(true);
    const target: InfinityQuery = { ...query.infinityQuery, refId: query.refId || query.infinityQuery.refId || 'field-mapping-query' };
    const subscription = datasource.query({ targets: [target] } as DataQueryRequest<InfinityQuery>).subscribe({
      next: (response) => {
        if (!isActive) {
          return;
        }
        const fieldNames = ((response.data[0] || { fields: [] }) as DataFrame).fields.map((f) => f.name);
        setChoices(fieldNames.map((f) => ({ value: f, label: f })));
        setIsLoading(false);
      },
      error: () => {
        if (isActive) {
          setChoices([]);
          setIsLoading(false);
        }
      },
    });
    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [datasource, query]);
  const onMetaPropChange = <Key extends keyof VariableMeta, Value extends VariableMeta[Key]>(key: Key, value: Value, meta = query.meta || {}) => {
    props.onChange({ ...query, meta: { ...meta, [key]: value } }, '');
  };
  return (
    <EditorRows>
      <EditorRow collapsible label="Custom field mapping" title={() => ''}>
        <EditorField label="Value Field" horizontal tooltip="Field name that can be used as a value of the variable">
          <Combobox isClearable value={query.meta?.valueField} onChange={(e) => onMetaPropChange('valueField', e?.value)} width={40} options={choices as Array<ComboboxOption<string>>} loading={isLoading} />
        </EditorField>
        <EditorField label="Text Field" horizontal tooltip="Field name that can be used as a display value of the variable">
          <Combobox isClearable value={query.meta?.textField} onChange={(e) => onMetaPropChange('textField', e?.value)} width={40} options={choices as Array<ComboboxOption<string>>} loading={isLoading} />
        </EditorField>
      </EditorRow>
    </EditorRows>
  );
};

const VariableEditorLegacy = (props: { query: VariableQueryLegacy; onChange: (query: VariableQueryLegacy, definition: string) => void; datasource: Datasource }) => {
  const { query, onChange } = props;
  const onQueryChange = (queryString: string) => {
    const newQuery = { ...query, query: queryString };
    onChange(newQuery, `${props.datasource.name}- (${newQuery.queryType}) ${newQuery.query}`);
  };
  return (
    <Field label="Query">
      <TextArea
        rows={5}
        placeholder="Collection(India,in,United Kingdom,uk)"
        value={query.query}
        onBlur={(e) => onQueryChange(e.currentTarget.value)}
        onChange={(e) => onQueryChange(e.currentTarget.value)}
      ></TextArea>
    </Field>
  );
};

const VariableEditorInfinity = (props: { query: VariableQueryInfinity; onChange: (query: VariableQueryInfinity, definition: string) => void; datasource: Datasource }) => {
  const { query, onChange, datasource } = props;
  const onInfinityQueryUpdate = (infinityQuery: InfinityQuery) => {
    const newQuery: VariableQueryInfinity = { ...query, infinityQuery } as VariableQueryInfinity;
    onChange(newQuery, `${props.datasource.name}- (${newQuery.queryType}) ${newQuery.infinityQuery?.type || newQuery.query}`);
  };
  return (
    <InfinityQueryEditor
      query={{ ...query.infinityQuery }}
      mode={'variable'}
      onChange={onInfinityQueryUpdate}
      onRunQuery={() => {}}
      instanceSettings={datasource.instanceSettings}
      datasource={datasource}
    ></InfinityQueryEditor>
  );
};

const VariableEditorRandom = (props: { query: VariableQueryRandom; onChange: (query: VariableQueryRandom, definition: string) => void; datasource: Datasource }) => {
  const { query, onChange } = props;
  const onQueryChange = (values: string[]) => {
    const newQuery = { ...query, values };
    onChange(newQuery, `${props.datasource.name}- (${newQuery.queryType}) ${(newQuery.values || []).join(',')}`);
  };
  return (
    <Field label="Values">
      <TagsInput tags={query.values || []} onChange={onQueryChange} placeholder="Enter values (enter key to add)" />
    </Field>
  );
};
