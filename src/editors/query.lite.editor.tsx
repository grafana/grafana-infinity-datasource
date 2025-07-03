import React, { useState, useEffect } from 'react';
import { llm } from '@grafana/llm';
import { Button, Card, Modal, Stack, TextArea, EmptySearchResult, Label } from '@grafana/ui';
import { getLLMSuggestion, getLLMSuggestions, type LLMSuggestionsOutput } from '@/app/llm';
import { Datasource } from '@/datasource';
import { EditorRows } from '@/components/extended/EditorRow';
import { URLEditor, URL } from '@/editors/query/query.url';
import { URLOptionsButton } from './query/query.options';
import type { InfinityQuery, EditorMode, InfinityQueryWithURLSource, InfinityQueryType, InfinityColumn } from '@/types';
import type { QueryEditorProps } from '@grafana/data';

export const LiteQueryEditor = (
  props: QueryEditorProps<Datasource, InfinityQuery> & {
    mode: EditorMode;
    datasource: Datasource;
    instanceSettings: any;
    query: InfinityQuery;
    onChange: (value: any) => void;
    onRunQuery: () => void;
    setQueryEditorMode: () => void;
  }
) => {
  const { query, datasource, onChange, onRunQuery, setQueryEditorMode } = props;
  const [llmEnabled, setLLMEnabled] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showUrlOptions, setShowUrlOptions] = useState(false);
  const [suggestions, setSuggestions] = useState<LLMSuggestionsOutput[]>([]);
  const [JSON_DATA, SET_JSON_DATA] = useState({});
  useEffect(() => {
    datasource
      .query({ targets: [{ ...query, parser: 'simple' }] } as any)
      .toPromise()
      .then((r) => SET_JSON_DATA(r?.data[0].meta.custom.data || {}));
  }, [query, datasource]);
  useEffect(() => {
    llm.enabled().then((res) => setLLMEnabled(res));
  }, []);
  const getAndSetLLMSuggestion = async () => {
    await getLLMSuggestion(JSON_DATA, promptInput)
      .then((root_selector) => {
        onChange({ ...query, parser: 'jq-backend', root_selector });
        onRunQuery();
      })
      .finally(() => setIsOpen(false));
  };
  const getAndSetLLMSuggestions = () => {
    getLLMSuggestions(JSON_DATA).then((res) => setSuggestions(res));
  };
  return (
    <>
      <div>
        <EditorRows>
          <Stack justifyContent={'center'} alignItems={'center'} gap={2} direction={'column'}>
            <Stack direction={'row'}>
              <Label style={{ padding: '10px' }}>URL</Label>
              <URL
                query={query as InfinityQueryWithURLSource<InfinityQueryType>}
                onChange={(query) => {
                  onChange({ ...query, root_selector: '' });
                  setSuggestions([]);
                  setPrompt('');
                }}
                onRunQuery={onRunQuery}
                onShowUrlOptions={() => setShowUrlOptions(!showUrlOptions)}
                liteMode={true}
              />
              <URLOptionsButton query={query} liteMode={true} onShowUrlOptions={() => setShowUrlOptions(!showUrlOptions)} />
              {llmEnabled ? (
                <div>
                  <Button
                    size="md"
                    icon="ai"
                    fill="outline"
                    onClick={(e) => {
                      setIsOpen(true);
                      getAndSetLLMSuggestions();
                      e.preventDefault();
                    }}
                  >
                    Ask AI
                  </Button>
                </div>
              ) : (
                <Button size="sm" icon="ai">
                  Configure parsing options
                </Button>
              )}
            </Stack>
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
              <Stack>
                <Button
                  icon="ai"
                  size="md"
                  fullWidth={false}
                  style={{ width: '160px' }}
                  disabled={!prompt}
                  onClick={(e) => {
                    setPromptInput(prompt);
                    getAndSetLLMSuggestion();
                    e.preventDefault();
                  }}
                >
                  Show Results
                </Button>
              </Stack>
            </Stack>
            {(suggestions || []).length > 0 ? (
              <>
                <h5>Suggested Insights</h5>
                {(suggestions || []).map((s) => (
                  <Card key={JSON.stringify(s)}>
                    <Card.Heading>{s.insight}</Card.Heading>
                    <Card.Description>
                      <b>JQ Query : </b>
                      <code>{s.jq_query}</code>
                    </Card.Description>
                    <Card.SecondaryActions>
                      <Button
                        variant="primary"
                        size="sm"
                        icon="bolt"
                        onClick={() => {
                          let columns: InfinityColumn[] = [];
                          s.fields.forEach((f) => columns.push({ selector: f.selector, text: f.display_name, type: f.type }));
                          let new_query: InfinityQuery = { ...query, parser: 'jq-backend', root_selector: s.jq_query, columns } as InfinityQuery;
                          onChange(new_query);
                          onRunQuery();
                          setIsOpen(false);
                        }}
                      >
                        Select
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon="cog"
                        onClick={() => {
                          let columns: InfinityColumn[] = [];
                          s.fields.forEach((f) => columns.push({ selector: f.selector, text: f.display_name, type: f.type }));
                          let new_query: InfinityQuery = { ...query, parser: 'jq-backend', root_selector: s.jq_query, columns } as InfinityQuery;
                          onChange(new_query);
                          onRunQuery();
                          setIsOpen(false);
                          setQueryEditorMode();
                        }}
                      >
                        Edit
                      </Button>
                    </Card.SecondaryActions>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <h5>Suggested Insights</h5>
                <EmptySearchResult>Loading suggestions...</EmptySearchResult>
              </>
            )}
          </Modal>
        </EditorRows>
      </div>
      {showUrlOptions && <URLEditor {...props} showByDefault={true} liteMode={true} />}
    </>
  );
};
