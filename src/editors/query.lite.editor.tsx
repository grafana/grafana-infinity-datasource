import React, { useState, useEffect } from 'react';
import { Button, Modal, Stack, TextArea, useTheme2 } from '@grafana/ui';
import { llm } from '@grafana/llm';
import { getLLMSuggestion } from '@/app/llm';
import { Datasource } from '@/datasource';
import { EditorRows } from '@/components/extended/EditorRow';
import { URLEditor, URL } from '@/editors/query/query.url';
import { URLOptionsButton } from './query/query.options';
import type { InfinityQuery, EditorMode, InfinityQueryWithURLSource, InfinityQueryType } from '@/types';
import type { QueryEditorProps } from '@grafana/data';

export const LiteQueryEditor = (
  props: QueryEditorProps<Datasource, InfinityQuery> & {
    mode: EditorMode;
    datasource: Datasource;
    instanceSettings: any;
    query: InfinityQuery;
    onChange: (value: any) => void;
    onRunQuery: () => void;
  }
) => {
  const { query, datasource, onChange, onRunQuery } = props;
  const [llmEnabled, setLLMEnabled] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showUrlOptions, setShowUrlOptions] = useState(false);
  const [JSON_DATA, SET_JSON_DATA] = useState({});
  const theme = useTheme2();
  useEffect(() => {
    datasource
      .query({ targets: [{ ...query, parser: 'simple' }] } as any)
      .toPromise()
      .then((r) => SET_JSON_DATA(r?.data[0].meta.custom.data || {}));
  }, [query, datasource]);
  useEffect(() => {
    llm.enabled().then((res) => setLLMEnabled(res));
  }, []);
  const getAndSetLLMSuggestion = () => {
    getLLMSuggestion(JSON_DATA, promptInput).then((root_selector) => {
      onChange({ ...query, parser: 'jq-backend', root_selector });
      onRunQuery();
    });
  };
  return (
    <>
      <div>
        <EditorRows>
          <Stack justifyContent={'center'} alignItems={'center'} gap={2} direction={'column'}>
            <h5>Enter your REST API URL</h5>
            <Stack direction={'row'} gap={1}>
              <URL
                query={query as InfinityQueryWithURLSource<InfinityQueryType>}
                onChange={onChange}
                onRunQuery={onRunQuery}
                onShowUrlOptions={() => setShowUrlOptions(!showUrlOptions)}
                liteMode={true}
              />
              <URLOptionsButton query={query} liteMode={true} onShowUrlOptions={() => setShowUrlOptions(!showUrlOptions)} />
            </Stack>
            {llmEnabled ? (
              <>
                <Button size="md" icon="ai" onClick={() => setIsOpen(true)}>
                  Ask Insights
                </Button>{' '}
                {/* <Button size="sm" icon="ai">
                  Configure parsing options
                </Button> */}
              </>
            ) : (
              <Button size="sm" icon="ai">
                Configure parsing options
              </Button>
            )}
          </Stack>
          <Modal title={'Ask for insights'} isOpen={isOpen} onDismiss={() => setIsOpen(!isOpen)}>
            <Stack direction={'column'} gap={2} alignItems={'center'} justifyContent={'center'}>
              <TextArea
                width={60}
                rows={5}
                placeholder={`Example: List only users from the country USA with the occupation of Software Engineer`}
                value={prompt}
                onChange={(e) => setPrompt(e.currentTarget.value || '')}
              />
              <Button
                icon="ai"
                size="md"
                fullWidth={false}
                style={{ width: '160px' }}
                onClick={(e) => {
                  setIsOpen(false);
                  setPromptInput(prompt);
                  getAndSetLLMSuggestion();
                  e.preventDefault();
                }}
              >
                Show Results
              </Button>
            </Stack>
          </Modal>
        </EditorRows>
      </div>
      {showUrlOptions && <URLEditor {...props} showByDefault={true} liteMode={true} />}
    </>
  );
};
