import React from 'react';
import { DataSourceSettings } from '@grafana/data';
import { render } from '@testing-library/react';
import { InfinityConfigEditor } from './InfinityConfigEditor';
import { InfinityConfig, InfinitySecureConfig } from './../types';

describe('InfinityConfigEditor', () => {
  it('should render correctly', () => {
    const options = {} as DataSourceSettings<InfinityConfig, InfinitySecureConfig>;
    const onOptionsChange = jest.fn();
    const result = render(<InfinityConfigEditor options={options} onOptionsChange={onOptionsChange} />);
    expect(result.container.firstChild).not.toBeNull();
  });
});
