import React from 'react';
import { InlineLabel, Input, Select } from '@grafana/ui';
import { EditorField } from './../../components/extended/EditorField';
import { EditorRow } from './../../components/extended/EditorRow';
import { Stack } from './../../components/extended/Stack';
import type { InfinityQuery, PaginationParamType, PaginationType } from './../../types';

type PaginationEditorProps = {
  query: InfinityQuery;
  onChange: (query: InfinityQuery) => void;
  onRunQuery: () => void;
};

export const PaginationEditor = (props: PaginationEditorProps) => {
  const { query, onChange } = props;
  return (
    <>
      <EditorRow label={'Pagination'} collapsible={true} collapsed={true} title={() => 'beta'}>
        <Stack gap={0} direction="row" wrap={true}>
          <Stack gap={1} wrap={false} direction="column">
            <EditorField label="Pagination Type">
              <Select<PaginationType>
                width={30}
                value={query.pagination_mode || 'none'}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'offset', label: 'Offset' },
                  { value: 'page', label: 'Page number' },
                  { value: 'cursor', label: 'Cursor' },
                ]}
                onChange={(e) => {
                  onChange({ ...query, pagination_mode: e.value || 'none' });
                }}
              />
            </EditorField>
            {query.pagination_mode !== 'none' && (
              <EditorField label="Max pages">
                <Input
                  type={'number'}
                  min={1}
                  max={5}
                  width={30}
                  value={query.pagination_max_pages || 5}
                  onChange={(e) => onChange({ ...query, pagination_max_pages: e.currentTarget.valueAsNumber || 1 })}
                />
              </EditorField>
            )}
          </Stack>
          {(query.pagination_mode === 'page' || query.pagination_mode === 'offset' || query.pagination_mode === 'cursor') && (
            <>
              <Stack gap={1} wrap={false} direction="column">
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
                      options={[
                        { value: 'query', label: 'Query param' },
                        { value: 'header', label: 'Header' },
                        { value: 'body_data', label: 'Body form' },
                        { value: 'body_json', label: 'Body JSON' },
                      ]}
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
                        options={[
                          { value: 'query', label: 'Query param' },
                          { value: 'header', label: 'Header' },
                          { value: 'body_data', label: 'Body form' },
                          { value: 'body_json', label: 'Body JSON' },
                        ]}
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
                        options={[
                          { value: 'query', label: 'Query param' },
                          { value: 'header', label: 'Header' },
                          { value: 'body_data', label: 'Body form' },
                          { value: 'body_json', label: 'Body JSON' },
                        ]}
                        value={query.pagination_param_page_field_type || 'query'}
                        onChange={(e) => onChange({ ...query, pagination_param_page_field_type: e.value || 'query' })}
                      />
                      <InlineLabel width={20}>Field value</InlineLabel>
                      <Input
                        width={20}
                        type="number"
                        value={query.pagination_param_page_value}
                        min={1}
                        max={2000}
                        onChange={(e) => onChange({ ...query, pagination_param_page_value: e.currentTarget.valueAsNumber || 0 })}
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
                        options={[
                          { value: 'query', label: 'Query param' },
                          { value: 'header', label: 'Header' },
                          { value: 'body_data', label: 'Body form' },
                          { value: 'body_json', label: 'Body JSON' },
                        ]}
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
        </Stack>
      </EditorRow>
    </>
  );
};
