import { Button, Input } from '@grafana/ui';
import React from 'react';

type StringArrayInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  addButtonText?: string;
};

export const StringArrayInput = ({ value, onChange, placeholder, addButtonText = 'Add' }: StringArrayInputProps) => {
  const onItemChange = (index: number, newValue: string) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };
  const removeItem = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };
  return (
    <>
      <table style={{ width: '100%' }}>
        <tbody>
          {(value || []).map((item, index) => (
            <tr key={index}>
              <td style={{ paddingInlineEnd: '10px', paddingBlockEnd: '4px' }}>
                <Input value={item} placeholder={placeholder} onChange={(e) => onItemChange(index, e.currentTarget.value)} />
              </td>
              <td style={{ width: '40px', paddingBlockEnd: '4px' }}>
                <Button
                  icon="trash-alt"
                  variant="destructive"
                  aria-label="Remove item"
                  fill="outline"
                  size="sm"
                  onClick={(e) => {
                    removeItem(index);
                    e.preventDefault();
                  }}
                />
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <Button
                variant="secondary"
                onClick={(e) => {
                  onChange([...(value || []), '']);
                  e.preventDefault();
                }}
              >
                {addButtonText}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
