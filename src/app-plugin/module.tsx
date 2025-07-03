import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppPlugin, AppRootProps } from '@grafana/data';
import { PluginPage, DataSourcePicker } from '@grafana/runtime';
import { InlineLabel, Stack } from '@grafana/ui';
import { URL, URLEditor } from '@/editors/query/query.url';
import { URLOptionsButton } from '@/editors/query/query.options';

const Explorer = () => {
  const [showURLOptions, setShowUrlOptions] = useState(false);
  return (
    <PluginPage>
      <Stack>
        <InlineLabel width={16} tooltip={'Select your infinity data source'}>
          Data source
        </InlineLabel>
        <DataSourcePicker width={20} />
        <InlineLabel width={10} tooltip={'Enter REST API URL'}>
          URL
        </InlineLabel>
        <URL query={{ url: '', url_options: { method: 'GET' }, type: 'json', source: 'url' } as any} onChange={() => {}} onRunQuery={() => {}} onShowUrlOptions={() => {}} liteMode={true} />
        <URLOptionsButton query={{} as any} liteMode={true} onShowUrlOptions={() => setShowUrlOptions(!showURLOptions)} />
      </Stack>
      {showURLOptions && (
        <div style={{ marginBlock: '20px' }}>
          <Stack>
            <URLEditor query={{} as any} onChange={() => {}} onRunQuery={() => {}} showByDefault={true} liteMode={false} instanceSettings={{ jsonData: { allowDangerousHTTPMethods: true } }} />
          </Stack>
        </div>
      )}
    </PluginPage>
  );
};

const PluginPropsContext = React.createContext<AppRootProps | null>(null);

export const plugin = new AppPlugin<{}>().setRootPage((props: AppRootProps) => {
  return (
    <PluginPropsContext.Provider value={props}>
      <Routes>
        <Route path="explore" Component={Explorer} />
        <Route path="*" Component={Explorer} />
      </Routes>
    </PluginPropsContext.Provider>
  );
});
