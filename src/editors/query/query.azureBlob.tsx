import React from 'react';
import { Input, Stack } from '@grafana/ui';
import { EditorRow } from '../../components/extended/EditorRow';
import { EditorField } from '../../components/extended/EditorField';
import { isDataQuery } from './../../app/utils';
import type { InfinityQuery } from './../../types';

type AzureBlobEditorProps = { query: InfinityQuery; onChange: (query: InfinityQuery) => void };

export const AzureBlobEditor = (props: AzureBlobEditorProps) => {
  const { query, onChange } = props;
  if (isDataQuery(query) && query.source === 'azure-blob') {
    return (
      <EditorRow label="Azure Blob details" collapsible={false} collapsed={true} title={() => ''}>
        <Stack gap={1} direction="row" wrap={'wrap'}>
          <EditorField label="Container Name" horizontal={true}>
            <Input value={query.azContainerName} width={39} onChange={(e) => onChange({ ...query, azContainerName: e.currentTarget.value })} />
          </EditorField>
          <EditorField label="Blob Name" horizontal={true}>
            <Input value={query.azBlobName} width={49} onChange={(e) => onChange({ ...query, azBlobName: e.currentTarget.value })} />
          </EditorField>
        </Stack>
      </EditorRow>
    );
  }
  return <></>;
};
