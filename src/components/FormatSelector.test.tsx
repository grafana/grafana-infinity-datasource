import React from 'react';
import { FormatSelector } from './FormatSelector';
import { render, within } from '@testing-library/react';
import { DefaultInfinityQuery, InfinityQuery } from '../types';
import { Components } from '../selectors';

const { Title: LabelTitle } = Components.QueryEditor.Format.Label;
const { Title: DropdownPlaceholderTitle } = Components.QueryEditor.Format.Dropdown.PlaceHolder;

describe('FormatSelector', () => {
  it('renders', () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const query: InfinityQuery = { ...DefaultInfinityQuery };
    const wrapper = render(<FormatSelector query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(wrapper).not.toBeNull();
    expect(wrapper.getByTitle(LabelTitle)).toBeInTheDocument();
    expect(wrapper.getByTitle(DropdownPlaceholderTitle)).toBeInTheDocument();
    expect(within(wrapper.getByTitle(DropdownPlaceholderTitle)).getByText('Table')).toBeInTheDocument();
  });
  it('renders timeseries format', () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const query: InfinityQuery = { type: 'json', format: 'timeseries', source: 'inline', data: '{}', json_options: {}, root_selector: '', columns: [], filters: [], refId: '' };
    const wrapper = render(<FormatSelector query={query} onChange={onChange} onRunQuery={onRunQuery} />);
    expect(wrapper).not.toBeNull();
    expect(wrapper.getByTitle(LabelTitle)).toBeInTheDocument();
    expect(wrapper.getByTitle(DropdownPlaceholderTitle)).toBeInTheDocument();
    expect(within(wrapper.getByTitle(DropdownPlaceholderTitle)).getByText('Time Series')).toBeInTheDocument();
  });
});
