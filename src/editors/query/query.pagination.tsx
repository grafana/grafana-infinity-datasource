import React from 'react';
import { InlineLabel, Input, Select, Stack } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { EditorField } from './../../components/extended/EditorField';
import { EditorRow } from './../../components/extended/EditorRow';
import type { InfinityQuery, PaginationParamType, PaginationType } from './../../types';

const paginationTypes: Array<SelectableValue<PaginationType>> = [
  { value: 'none', label: 'None' },
  { value: 'offset', label: 'Offset' },
  { value: 'page', label: 'Page number' },
  { value: 'cursor', label: 'Cursor' },
  { value: 'list', label: 'List of values' },
];

const paginationParamTypes: Array<SelectableValue<PaginationParamType>> = [
  { value: 'query', label: 'Query param' },
  { value: 'header', label: 'Header' },
  { value: 'body_data', label: 'Body form' },
  // { value: 'body_json', label: 'Body JSON' },
  { value: 'replace', label: 'Replace URL' },
];

type PaginationEditorProps = {
  query: InfinityQuery;
  onChange: (query: InfinityQuery) => void;
  onRunQuery: () => void;
};

export const PaginationEditor = (props: PaginationEditorProps) => {
  const { query, onChange } = props;
  return (
    <EditorRow label={'Pagination'} collapsible={true} collapsed={false} title={() => 'beta'}>
      <Stack direction="row" wrap={'wrap'}>
        <Stack wrap={'nowrap'} direction="column">
          <EditorField label="Pagination Type">
            <Select<PaginationType> width={30} value={query.pagination_mode || 'none'} options={paginationTypes} onChange={(e) => onChange({ ...query, pagination_mode: e.value || 'none' })} />
          </EditorField>
          {query.pagination_mode && query.pagination_mode !== 'none' && (
            <EditorField label="Max pages" tooltip={'maximum of 5 pages. minimum of 1 page. Default 1'}>
              <Input
                type={'number'}
                min={1}
                max={5}
                width={30}
                value={query.pagination_max_pages}
                onChange={(e) => onChange({ ...query, pagination_max_pages: e.currentTarget.valueAsNumber || 1 })}
                placeholder="min:1, max:5"
              />
            </EditorField>
          )}
        </Stack>
        {(query.pagination_mode === 'offset' || query.pagination_mode === 'page' || query.pagination_mode === 'cursor') && (
          <>
            <Stack gap={1} wrap={'wrap'} direction="column">
              <EditorField label="Size field">
                <Stack>
                  <InlineLabel width={12}>Field name</InlineLabel>
                  <Input
                    width={30}
                    value={query.pagination_param_size_field_name || ''}
                    onChange={(e) => onChange({ ...query, pagination_param_size_field_name: e.currentTarget.value })}
                    placeholder="limit/size/count/... defaults to limit"
                  />
                  <InlineLabel width={12}>Field type</InlineLabel>
                  <Select<PaginationParamType>
                    width={20}
                    options={paginationParamTypes}
                    value={query.pagination_param_size_field_type || 'query'}
                    onChange={(e) => onChange({ ...query, pagination_param_size_field_type: e.value || 'query' })}
                  />
                  <InlineLabel width={20}>Field value</InlineLabel>
                  <Input
                    width={20}
                    type="number"
                    value={query.pagination_param_size_value}
                    min={1}
                    max={2000}
                    onChange={(e) => onChange({ ...query, pagination_param_size_value: e.currentTarget.valueAsNumber || 0 })}
                  ></Input>
                </Stack>
              </EditorField>
              {query.pagination_mode === 'offset' && (
                <EditorField label="Offset field">
                  <Stack>
                    <InlineLabel width={12}>Field name</InlineLabel>
                    <Input
                      width={30}
                      value={query.pagination_param_offset_field_name || ''}
                      onChange={(e) => onChange({ ...query, pagination_param_offset_field_name: e.currentTarget.value })}
                      placeholder="offset"
                    />
                    <InlineLabel width={12}>Field type</InlineLabel>
                    <Select<PaginationParamType>
                      width={20}
                      options={paginationParamTypes}
                      value={query.pagination_param_offset_field_type || 'query'}
                      onChange={(e) => onChange({ ...query, pagination_param_offset_field_type: e.value || 'query' })}
                    />
                    <InlineLabel width={20} tooltip={'Initial value for the first page. Defaults to 0. For the subsequent pages, it will (initialValue + ((pageNumber -1) * pageSize))'}>
                      Initial value
                    </InlineLabel>
                    <Input
                      width={20}
                      type="number"
                      value={query.pagination_param_offset_value}
                      min={1}
                      max={2000}
                      onChange={(e) => onChange({ ...query, pagination_param_offset_value: e.currentTarget.valueAsNumber || 0 })}
                    ></Input>
                  </Stack>
                </EditorField>
              )}
              {query.pagination_mode === 'page' && (
                <EditorField label="Page field">
                  <Stack>
                    <InlineLabel width={12}>Field name</InlineLabel>
                    <Input
                      width={30}
                      value={query.pagination_param_page_field_name || ''}
                      onChange={(e) => onChange({ ...query, pagination_param_page_field_name: e.currentTarget.value })}
                      placeholder="page"
                    />
                    <InlineLabel width={12}>Field type</InlineLabel>
                    <Select<PaginationParamType>
                      width={20}
                      options={paginationParamTypes}
                      value={query.pagination_param_page_field_type || 'query'}
                      onChange={(e) => onChange({ ...query, pagination_param_page_field_type: e.value || 'query' })}
                    />
                    <InlineLabel width={20} tooltip={'initial page number. Defaults to 1'}>
                      Field value
                    </InlineLabel>
                    <Input
                      width={20}
                      type="number"
                      value={query.pagination_param_page_value}
                      min={1}
                      onChange={(e) => onChange({ ...query, pagination_param_page_value: e.currentTarget.valueAsNumber || 1 })}
                    ></Input>
                  </Stack>
                </EditorField>
              )}
              {query.pagination_mode === 'cursor' && (
                <EditorField label="Cursor field">
                  <Stack>
                    <InlineLabel width={12}>Field name</InlineLabel>
                    <Input
                      width={30}
                      value={query.pagination_param_cursor_field_name || ''}
                      onChange={(e) => onChange({ ...query, pagination_param_cursor_field_name: e.currentTarget.value })}
                      placeholder="cursor"
                    />
                    <InlineLabel width={12}>Field type</InlineLabel>
                    <Select<PaginationParamType>
                      width={20}
                      options={paginationParamTypes}
                      value={query.pagination_param_cursor_field_type || 'query'}
                      onChange={(e) => onChange({ ...query, pagination_param_cursor_field_type: e.value || 'query' })}
                    />
                    <InlineLabel width={20} tooltip="selector to extract the cursor">
                      Extraction path
                    </InlineLabel>
                    <Input
                      width={20}
                      value={query.pagination_param_cursor_extraction_path}
                      onChange={(e) => onChange({ ...query, pagination_param_cursor_extraction_path: e.currentTarget.value || '' })}
                      placeholder="selector to extract the cursor"
                    ></Input>
                  </Stack>
                </EditorField>
              )}
            </Stack>
          </>
        )}
        {query.pagination_mode === 'list' && (
          <>
            <Stack gap={1} wrap={'nowrap'} direction="column">
              <EditorField label="Variables List" invalid={(query.pagination_param_list_value || '').split(',').length > 5}>
                <Stack>
                  <InlineLabel width={12}>Field name</InlineLabel>
                  <Input
                    width={30}
                    value={query.pagination_param_list_field_name || ''}
                    onChange={(e) => onChange({ ...query, pagination_param_list_field_name: e.currentTarget.value })}
                    placeholder="id"
                  />
                  <InlineLabel width={12}>Field type</InlineLabel>
                  <Select<PaginationParamType>
                    width={20}
                    options={paginationParamTypes}
                    value={query.pagination_param_list_field_type || 'query'}
                    onChange={(e) => onChange({ ...query, pagination_param_list_field_type: e.value || 'query' })}
                  />
                  <InlineLabel width={20} tooltip="comma separated values">
                    Field value
                  </InlineLabel>
                  <Input
                    width={20}
                    value={query.pagination_param_list_value}
                    onChange={(e) => onChange({ ...query, pagination_param_list_value: e.currentTarget.value || '' })}
                    placeholder="foo,bar,baz"
                  ></Input>
                </Stack>
              </EditorField>
            </Stack>
          </>
        )}
      </Stack>
    </EditorRow>
  );
};
