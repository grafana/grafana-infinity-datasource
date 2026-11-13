import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { selectors } from '@grafana/e2e-selectors';
import type { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { ReferenceDataEditor } from '@/editors/config/ReferenceData';
import type { InfinityOptions } from '@/types';

type Options = DataSourcePluginOptionsEditorProps<InfinityOptions>['options'];

const Editor = ({ onChange }: { onChange: (options: Options) => void }) => {
  const [options, setOptions] = useState({ jsonData: { refData: [{ name: '', data: '' }] } } as unknown as Options);
  return (
    <ReferenceDataEditor
      options={options}
      onOptionsChange={(o) => {
        setOptions(o);
        onChange(o);
      }}
    />
  );
};

describe('ReferenceDataEditor', () => {
  it('lets you type a name for the reference data', async () => {
    const onChange = jest.fn();
    render(<Editor onChange={onChange} />);
    const name = screen.getByPlaceholderText('Give an unique name to your reference data');
    await userEvent.click(name);
    await userEvent.keyboard('users');
    expect(name).toHaveValue('users');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ jsonData: { refData: [{ name: 'users', data: '' }] } }));
  });

  // Grafana 13.3 sets `pointer-events: none` on every input inside a card heading, so the name field must not live there.
  it('keeps the name field out of the card heading', () => {
    render(<Editor onChange={jest.fn()} />);
    const name = screen.getByPlaceholderText('Give an unique name to your reference data');
    expect(name.closest(`[data-testid="${selectors.components.Card.heading}"]`)).toBeNull();
  });
});
