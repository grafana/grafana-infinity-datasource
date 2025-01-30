import React, { useState } from 'react';
import { Button, Drawer, Card, useTheme2, InlineLabel, Input, Stack } from '@grafana/ui';
import { EditorRow } from './../../components/extended/EditorRow';
import type { InfinityQuery, TransformationItem } from './../../types';

type TransformationsEditorProps = {
  query: InfinityQuery;
  onChange: (query: InfinityQuery) => void;
  onRunQuery: () => void;
};

export const TransformationsEditor = (props: TransformationsEditorProps) => {
  const { query, onChange, onRunQuery } = props;
  const [isListOpen, setListIsOpen] = useState(false);
  const theme = useTheme2();
  if (query.type !== 'transformations') {
    return <></>;
  }
  let transformations: TransformationItem[] = query.transformations || [];
  const onDeleteTransformation = (index: number) => {
    if (query.transformations && query.transformations.length > 0) {
      let ts = [...(query.transformations || [])];
      ts.splice(index, 1);
      onChange({ ...query, transformations: ts });
    }
    onRunQuery();
  };
  const updateTransformation = (index: number, tr: TransformationItem) => {
    let ts = transformations.map((t, i) => {
      if (i === index) {
        return tr;
      }
      return t;
    });
    onChange({ ...query, transformations: ts || [] });
  };
  return (
    <>
      {isListOpen && (
        <Drawer onClose={() => setListIsOpen(false)} title="Transformations List">
          <>
            <Card>
              <Card.Heading>Limit</Card.Heading>
              <Card.Actions>
                <Button
                  onClick={() => {
                    onChange({
                      ...query,
                      transformations: [
                        ...transformations,
                        {
                          type: 'limit',
                          limit: { limitField: 10 },
                        },
                      ],
                    });
                    setListIsOpen(false);
                  }}
                >
                  Add
                </Button>
              </Card.Actions>
            </Card>
            <Card>
              <Card.Heading>Filter Expression</Card.Heading>
              <Card.Actions>
                <Button
                  onClick={() => {
                    onChange({
                      ...query,
                      transformations: [
                        ...transformations,
                        {
                          type: 'filterExpression',
                          filterExpression: { expression: '' },
                        },
                      ],
                    });
                    setListIsOpen(false);
                  }}
                >
                  Add
                </Button>
              </Card.Actions>
            </Card>
            <Card>
              <Card.Heading>Computed Column</Card.Heading>
              <Card.Actions>
                <Button
                  onClick={() => {
                    onChange({
                      ...query,
                      transformations: [
                        ...transformations,
                        {
                          type: 'computedColumn',
                          computedColumn: { expression: '', alias: '' },
                        },
                      ],
                    });
                    setListIsOpen(false);
                  }}
                >
                  Add
                </Button>
              </Card.Actions>
            </Card>
            <Card>
              <Card.Heading>Summarize / Group by</Card.Heading>
              <Card.Actions>
                <Button
                  onClick={() => {
                    onChange({
                      ...query,
                      transformations: [
                        ...transformations,
                        {
                          type: 'summarize',
                          summarize: { expression: '', by: '' },
                        },
                      ],
                    });
                    setListIsOpen(false);
                  }}
                >
                  Add
                </Button>
              </Card.Actions>
            </Card>
          </>
        </Drawer>
      )}
      {transformations && transformations.length > 0 ? (
        <EditorRow label="Transformations">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {transformations.map((t, i) => (
              <div
                key={JSON.stringify(t)}
                style={{
                  border: `1px solid ${theme.colors.border.medium}`,
                  background: theme.colors.background.primary,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.5s ease-in 0s',
                  marginInlineEnd: `5px`,
                  marginBlock: '5px',
                }}
              >
                <div style={{ margin: theme.spacing(1, 1, 0.5, 1), display: 'flex' }}>
                  {t.type === 'limit' && (
                    <Stack direction="column" gap={1}>
                      <Stack direction="row" alignItems={'stretch'}>
                        <h5 style={{ marginBlock: theme.spacing(0.5) }}>Limit</h5>
                        <Button variant="secondary" fill="outline" icon="trash-alt" size="sm" onClick={() => onDeleteTransformation(i)} />
                      </Stack>
                      <div className="gf-form">
                        <InlineLabel width={10}>Limit</InlineLabel>
                        <Input
                          width={10}
                          value={t.limit?.limitField || 10}
                          type="number"
                          onChange={(e) => {
                            if (transformations[i] && transformations[i].type === 'limit') {
                              updateTransformation(i, { type: 'limit', limit: { limitField: e.currentTarget.valueAsNumber } });
                            }
                          }}
                        ></Input>
                      </div>
                    </Stack>
                  )}
                  {t.type === 'filterExpression' && (
                    <Stack direction="column" gap={1}>
                      <Stack direction="row" alignItems={'stretch'}>
                        <h5 style={{ marginBlock: theme.spacing(0.5) }}>Filter Expression</h5>
                        <Button variant="secondary" fill="outline" icon="trash-alt" size="sm" onClick={() => onDeleteTransformation(i)} />
                      </Stack>
                      <div className="gf-form">
                        <InlineLabel width={14}>Expression</InlineLabel>
                        <Input
                          width={24}
                          value={t.filterExpression?.expression || ''}
                          onChange={(e) => {
                            if (transformations[i] && transformations[i].type === 'filterExpression') {
                              updateTransformation(i, { type: 'filterExpression', filterExpression: { expression: e.currentTarget.value || '' } });
                            }
                          }}
                        ></Input>
                      </div>
                    </Stack>
                  )}
                  {t.type === 'summarize' && (
                    <Stack direction="column" gap={1}>
                      <Stack direction="row" alignItems={'stretch'}>
                        <h5 style={{ marginBlock: theme.spacing(0.5) }}>Summarize</h5>
                        <Button variant="secondary" fill="outline" icon="trash-alt" size="sm" onClick={() => onDeleteTransformation(i)} />
                      </Stack>
                      <div className="gf-form">
                        <InlineLabel width={14}>Expression</InlineLabel>
                        <Input
                          width={24}
                          value={t.summarize?.expression || ''}
                          onChange={(e) => {
                            if (transformations[i] && transformations[i].type === 'summarize') {
                              updateTransformation(i, { type: 'summarize', summarize: { by: t.summarize?.by || '', alias: t.summarize?.alias || '', expression: e.currentTarget.value || '' } });
                            }
                          }}
                        ></Input>
                      </div>
                      <div className="gf-form">
                        <InlineLabel width={14}>By</InlineLabel>
                        <Input
                          width={24}
                          value={t.summarize?.by || ''}
                          onChange={(e) => {
                            if (transformations[i] && transformations[i].type === 'summarize') {
                              updateTransformation(i, {
                                type: 'summarize',
                                summarize: { expression: t.summarize?.expression || '', alias: t.summarize?.alias || '', by: e.currentTarget.value || '' },
                              });
                            }
                          }}
                        ></Input>
                      </div>
                      <div className="gf-form">
                        <InlineLabel width={14}>Alias</InlineLabel>
                        <Input
                          width={24}
                          value={t.summarize?.alias || ''}
                          onChange={(e) => {
                            if (transformations[i] && transformations[i].type === 'summarize') {
                              updateTransformation(i, { type: 'summarize', summarize: { expression: t.summarize?.expression || '', by: t.summarize?.by || '', alias: e.currentTarget.value || '' } });
                            }
                          }}
                        ></Input>
                      </div>
                    </Stack>
                  )}
                  {t.type === 'computedColumn' && (
                    <Stack direction="column" gap={1}>
                      <Stack direction="row" alignItems={'stretch'}>
                        <h5 style={{ marginBlock: theme.spacing(0.5) }}>Computed Column</h5>
                        <Button variant="secondary" fill="outline" icon="trash-alt" size="sm" onClick={() => onDeleteTransformation(i)} />
                      </Stack>
                      <div className="gf-form">
                        <InlineLabel width={14}>Expression</InlineLabel>
                        <Input
                          width={24}
                          value={t.computedColumn?.expression || ''}
                          onChange={(e) => {
                            if (transformations[i] && transformations[i].type === 'computedColumn') {
                              updateTransformation(i, { type: 'computedColumn', computedColumn: { alias: t.computedColumn?.alias || '', expression: e.currentTarget.value || '' } });
                            }
                          }}
                        ></Input>
                      </div>
                      <div className="gf-form">
                        <InlineLabel width={14}>Alias</InlineLabel>
                        <Input
                          width={24}
                          value={t.computedColumn?.alias || ''}
                          onChange={(e) => {
                            if (transformations[i] && transformations[i].type === 'computedColumn') {
                              updateTransformation(i, { type: 'computedColumn', computedColumn: { expression: t.computedColumn?.expression || '', alias: e.currentTarget.value || '' } });
                            }
                          }}
                        ></Input>
                      </div>
                    </Stack>
                  )}
                </div>
              </div>
            ))}
          </div>
        </EditorRow>
      ) : (
        <></>
      )}
      <div style={{ marginBlock: theme.spacing(1) }}>
        <Button onClick={() => setListIsOpen(true)} size="md" fill="outline">
          Add Transformation
        </Button>
      </div>
    </>
  );
};
