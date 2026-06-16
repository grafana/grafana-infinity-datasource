import { Button, Combobox, type ComboboxOption } from '@grafana/ui';
import React from 'react';
import { EditorRow } from '@/components/extended/EditorRow';
import { EditorField } from '@/components/extended/EditorField';
import { filterOperators } from '@/app/parsers/filter';
import { isDataQuery } from '@/app/utils';
import { FilterOperator } from '@/constants';
import type { InfinityFilter, InfinityQuery } from '@/types';

export const TableFilter = (props: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: any }) => {
  const { query, onChange } = props;
  if (!isDataQuery(query)) {
    return <></>;
  }
  const getFields = () => {
    return query.columns.map((col, index) => {
      return {
        label: col.text || col.selector || `column ${0 + index}`,
        value: col.text || col.selector,
      };
    });
  };
  const addFilter = () => {
    let filters = [...(query.filters || [])];
    let newFilter: InfinityFilter = {
      field: query.columns && query.columns.length > 0 ? query.columns[0].text : '',
      operator: FilterOperator.Equals,
      value: [''],
    };
    filters.push(newFilter);
    onChange({ ...query, filters });
  };
  const removeFilter = (index: number) => {
    const filters = [...(query.filters || [])];
    filters.splice(index, 1);
    onChange({ ...query, filters });
  };
  const onFilterFieldChange = (index: number, v: ComboboxOption<string>) => {
    const filters = [...(query.filters || [])];
    filters[index] = { ...filters[index], field: v.value };
    onChange({ ...query, filters });
  };
  const onFilterOperatorChange = (index: number, v: ComboboxOption<FilterOperator>) => {
    const filters = [...(query.filters || [])];
    filters[index] = { ...filters[index], operator: v.value };
    onChange({ ...query, filters });
  };
  const onFilterValueChange = (index: number, valueIndex: number, v: string) => {
    const filters = [...(query.filters || [])];
    filters[index] = { ...filters[index], value: filters[index].value.map((val, i) => (i === valueIndex ? v : val)) };
    onChange({ ...query, filters });
  };
  return (
    <EditorRow label="Results Filter" collapsible={true} collapsed={false} title={() => `${(query?.filters || [])?.length} Filters. Try backend/UQL filter instead.`}>
      <EditorField label={`Results Filter`}>
        <>
          {query.filters && query.filters.length > 0 ? (
            <>
              {query.filters.map((filter, index) => (
                <div className="gf-form-inline" key={index}>
                  <label className="gf-form-label width-6">Filter {index + 1}</label>
                  <Combobox
                    width={16}
                    options={getFields()}
                    value={getFields().find((f) => f.value === filter.field)?.value || getFields()[0]?.value || ''}
                    onChange={(e) => onFilterFieldChange(index, e)}
                  />
                  <Combobox
                    width={16}
                    options={filterOperators}
                    value={filterOperators.find((f) => f.value === filter.operator)?.value || filterOperators[0]?.value || 'equals'}
                    onChange={(e) => onFilterOperatorChange(index, e)}
                  />
                  <input
                    type="text"
                    className="gf-form-input min-width-10 width-10"
                    value={filter.value[0]}
                    onChange={(e) => onFilterValueChange(index, 0, e.target.value)}
                    placeholder="Value"
                  ></input>
                  <Button
                    title="Delete filter"
                    variant="destructive"
                    aria-label="Remove item"
                    size="sm"
                    style={{ marginTop: '4px' }}
                    onClick={() => removeFilter(index)}
                    icon="trash-alt"
                    fill="outline"
                  ></Button>
                  <br />
                </div>
              ))}
            </>
          ) : (
            <></>
          )}
          <Button
            variant="secondary"
            size="sm"
            style={{ marginTop: '5px', marginRight: '10px' }}
            onClick={(e) => {
              addFilter();
              e.preventDefault();
            }}
          >
            Add filter
          </Button>
        </>
      </EditorField>
    </EditorRow>
  );
};
