import React from 'react';
import { OpenAssistantButton, createAssistantContextItem } from '@grafana/assistant';
import type { PanelData } from '@grafana/data';
import type { InfinityParserType } from '@/types';

type RootSelectorAssistantProps = { parser?: InfinityParserType; datasourceUid?: string; panelData?: PanelData };

export const RootSelectorAssistant = (props: RootSelectorAssistantProps) => {
  const { panelData, datasourceUid, parser } = props;
  if (!datasourceUid) {
    return <></>;
  }
  if (parser !== 'backend' && parser !== 'jq-backend') {
    return <></>;
  }
  const parserLang = parser === 'jq-backend' ? 'JQ' : 'JSONata';
  return (
    <OpenAssistantButton
      title="Use Assistant to parse data"
      origin="grafana-datasources/yesoreyeram-infinity-datasource/query-builder-parser"
      size="sm"
      prompt={`Create a ${parserLang} parser expression that extracts rows from provided data. The expression should work with the sample data provided in the context.`}
      context={getChatContext(datasourceUid, parserLang, panelData)}
    />
  );
};

const getChatContext = (datasourceUid: string, parserLang: 'JQ' | 'JSONata', panelData?: PanelData) => {
  const data = panelData?.series?.[0]?.meta?.custom?.data || [];
  const stringifiedData = Array.isArray(data) ? JSON.stringify(data.slice(0, 5)) : JSON.stringify(data ?? '').slice(0, 1500); // We take first 5 items if it is array, or the first 1500 character
  const basicRootSelector = parserLang === 'JQ' ? '.' : '$';
  const instructions = `
    - The data is provided in string format as a stringifiedData
    - Analyze the data structure first: identify if it's an array of objects, nested objects, or mixed structure
    - Use proper ${parserLang} syntax
    - Use ${basicRootSelector} as a root selector
    - If data has null/undefined values, handle them gracefully with null coalescing or default values
    - Provide 3 different examples:
      1. Basic extraction
      2. Nested extraction
      3. Filtered extraction
    - Explain what each expression does`;
  return [
    createAssistantContextItem('datasource', { datasourceUid }),
    createAssistantContextItem('structured', { title: 'Data', data: { stringifiedData } }),
    createAssistantContextItem('structured', { hidden: true, title: 'Page-specific instructions', data: { instructions } }),
  ];
};
