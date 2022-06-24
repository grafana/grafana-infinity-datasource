import { Button, Input } from '@grafana/ui';
import React from 'react';
import type { InfinityKV } from './../types';

export const KeyValueEditor = (props: { value: InfinityKV[]; onChange: (value: InfinityKV[]) => void; defaultValue?: InfinityKV; addButtonText?: string }) => {
  const { value, onChange, defaultValue = { key: '', value: '' }, addButtonText = 'Add' } = props;
  const onItemChange = (index: number, key: keyof InfinityKV, valueToUpdate: string) => {
    const newValues = [...value];
    newValues[index] = { ...newValues[index], [key]: valueToUpdate };
    onChange(newValues);
  };
  const removeItem = (index: number) => {
    const newValues = [...value];
    newValues.splice(index, 1);
    onChange(newValues);
  };
  return (
    <>
      <table style={{ width: '100%' }}>
        {value && value.length > 0 && (
          <thead>
            <td width="40%">Key</td>
            <td width="40%">Value</td>
            <td width="20%"></td>
          </thead>
        )}
        {value &&
          value.map((header, index) => (
            <tr key={index}>
              <td>
                <Input value={header.key} onChange={(e) => onItemChange(index, 'key', e.currentTarget.value)}></Input>
              </td>
              <td>
                <Input value={header.value} onChange={(e) => onItemChange(index, 'value', e.currentTarget.value)}></Input>
              </td>
              <td>
                <Button icon="trash-alt" variant="secondary" size="sm" onClick={() => removeItem(index)} />
              </td>
            </tr>
          ))}
      </table>
      <div style={{ width: '100%', textAlign: 'left' }}>
        <Button variant="secondary" size="md" onClick={(e) => onChange([...(value || []), { ...defaultValue }])}>
          {addButtonText}
        </Button>
      </div>
    </>
  );
};
