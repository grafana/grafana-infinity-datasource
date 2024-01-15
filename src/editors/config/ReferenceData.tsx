import React from 'react';
import { Button, Card, InlineFormLabel, Input, TextArea } from '@grafana/ui';
import type { InfinityOptions, InfinityReferenceData } from '../../types';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';

export const ReferenceDataEditor = (props: DataSourcePluginOptionsEditorProps<InfinityOptions>) => {
  const { options, onOptionsChange } = props;
  const { jsonData = {} } = options;
  const { refData = [] } = jsonData;
  const addReferenceData = () => {
    const newRefData = [...refData];
    newRefData.push({ name: '', data: '' });
    onOptionsChange({ ...options, jsonData: { ...jsonData, refData: newRefData } });
  };
  const onNameUpdate = <K extends keyof InfinityReferenceData, V extends InfinityReferenceData[K]>(index: number, key: K, value: V) => {
    const newRefData = [...refData];
    newRefData[index] = { ...newRefData[index], [key]: value };
    onOptionsChange({ ...options, jsonData: { ...jsonData, refData: newRefData } });
  };
  const onRemove = (index: number) => {
    const newRefData = [...refData];
    newRefData.splice(index, 1);
    onOptionsChange({ ...options, jsonData: { ...jsonData, refData: newRefData } });
  };
  return (
    <>
      {refData.map((rd, rdi) => {
        return (
          <Card key={rdi}>
            <Card.Heading>
              <InlineFormLabel width={5}>Name</InlineFormLabel>
              <Input value={rd.name} placeholder="Give an unique name to your reference data" onChange={(e) => onNameUpdate(rdi, 'name', e.currentTarget.value)} />
            </Card.Heading>
            <Card.Description>
              <TextArea value={rd.data} placeholder="Enter data here. either json / csv / tsv / xml / html" onChange={(e) => onNameUpdate(rdi, 'data', e.currentTarget.value)} rows={5} />
            </Card.Description>
            <Card.Actions>
              <Button
                icon="trash-alt"
                variant="destructive"
                size="sm"
                fill="outline"
                onClick={(e) => {
                  onRemove(rdi);
                  e.preventDefault();
                }}
              >
                Delete
              </Button>
            </Card.Actions>
          </Card>
        );
      })}
      <div className="gf-form">
        <Button
          variant="secondary"
          size="md"
          icon="plus"
          onClick={(e) => {
            addReferenceData();
            e.preventDefault();
          }}
        >
          Add reference data
        </Button>
      </div>
    </>
  );
};
