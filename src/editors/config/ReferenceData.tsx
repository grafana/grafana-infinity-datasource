import React from 'react';
import { Button, InlineFormLabel, Input, TextArea } from '@grafana/ui';
import type { InfinityOptions, InfinityReferenceData } from '../../types';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data/types';

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
          <>
            <div className="gf-form">
              <InlineFormLabel width={5} tooltip="Reference name">
                Name
              </InlineFormLabel>
              <Input value={rd.name} placeholder="Name" onChange={(e) => onNameUpdate(rdi, 'name', e.currentTarget.value)} width={20} />
              <InlineFormLabel width={5} tooltip="Reference data">
                Data
              </InlineFormLabel>
              <TextArea value={rd.data} placeholder="Value" onChange={(e) => onNameUpdate(rdi, 'data', e.currentTarget.value)} rows={5} />
              <Button
                icon="trash-alt"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  onRemove(rdi);
                  e.preventDefault();
                }}
              />
            </div>
          </>
        );
      })}
      <div className="gf-form">
        <Button
          variant="secondary"
          size="md"
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
