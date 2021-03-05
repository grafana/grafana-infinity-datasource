import React from 'react';
import { set } from 'lodash';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { SCRAP_QUERY_RESULT_FORMATS, InfinityQuery } from '../../shared/types';

interface AdvancedOptionsProps {
  query: InfinityQuery;
  onChange: (value: any) => void;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ query, onChange }) => {
  const defaultFormat = { value: 'table', label: 'Table' };

  const onSelectChange = (selectableItem: SelectableValue, field: string) => {
    set(query, field, selectableItem.value);
    onChange(query);
  };

  return (
    <div className="gf-form-inline">
      <div className="gf-form">
        {query.type === 'series' ? (
          <></>
        ) : (
          <>
            <label className="gf-form-label query-keyword width-8">Format</label>
            <Select
              className="min-width-12 width-12"
              value={SCRAP_QUERY_RESULT_FORMATS.find((field: any) => field.value === query.format) || defaultFormat}
              options={SCRAP_QUERY_RESULT_FORMATS}
              defaultValue={defaultFormat}
              onChange={e => onSelectChange(e, 'format')}
            ></Select>
          </>
        )}
      </div>
    </div>
  );
};
