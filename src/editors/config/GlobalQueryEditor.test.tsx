import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { getDataSourceInstance } from '@grafana/plugin-compat/datasources';
import { GlobalQueryEditor } from '@/editors/config/GlobalQueryEditor';

jest.mock('@grafana/plugin-compat/datasources', () => ({
  getDataSourceInstance: jest.fn(async () => ({ name: 'infinity' })),
}));

describe('editors/config/GlobalQueryEditor', () => {
  it('loads the data source instance through plugin-compat for each global query', async () => {
    const options = {
      name: 'my-infinity',
      jsonData: {
        global_queries: [{ name: 'My Query', id: 'my-query-1', query: { refId: 'my-query-1', type: 'csv', source: 'inline', data: '' } }],
      },
    } as any;
    const result = render(<GlobalQueryEditor options={options} onOptionsChange={jest.fn()} />);
    expect(result.getByDisplayValue('my-query-1')).toBeInTheDocument();
    await waitFor(() => expect(getDataSourceInstance).toHaveBeenCalledWith('my-infinity'));
  });
});
