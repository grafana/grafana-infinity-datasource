import { render } from '@testing-library/react';
import React from 'react';
import { DefaultInfinityQuery } from '@/constants';
import { Components } from '@/selectors';
import { FormatSelector } from '@/components/FormatSelector';
import type { InfinityQuery } from '@/types';

const { Text: LabelText } = Components.QueryEditor.Format.Label;
const { Title: DropdownPlaceholderTitle } = Components.QueryEditor.Format.Dropdown.PlaceHolder;

describe('FormatSelector', () => {
  it('renders', () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const query: InfinityQuery = { ...DefaultInfinityQuery };
    const wrapper = render(<FormatSelector query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(wrapper).not.toBeNull();
    expect(wrapper.getByText(LabelText)).toBeInTheDocument();
    expect(wrapper.getByTitle(DropdownPlaceholderTitle)).toBeInTheDocument();
    expect(wrapper.getByDisplayValue('Table')).toBeInTheDocument();
  });
  it('renders timeseries format', () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const query: InfinityQuery = { type: 'json', format: 'timeseries', source: 'inline', data: '{}', json_options: {}, root_selector: '', columns: [], filters: [], refId: '' };
    const wrapper = render(<FormatSelector query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(wrapper).not.toBeNull();
    expect(wrapper.getByText(LabelText)).toBeInTheDocument();
    expect(wrapper.getByTitle(DropdownPlaceholderTitle)).toBeInTheDocument();
    expect(wrapper.getByDisplayValue('Time Series')).toBeInTheDocument();
  });
});
