import React from 'react';
import { InlineFormLabel, CodeEditor, CodeEditorSuggestionItem, Icon, CodeEditorSuggestionItemKind } from '@grafana/ui';
import { InfinityQuery, EditorMode } from '../../types';
declare const monaco: any;

const UQLTips: string[] = [
  '💡 While editing UQL, you can press ctrl+s/cmd+s to run the query',
  '💡 You can use `project kv()` command to transform key value pair/object into array',
  '💡 You can use `mv-expand "colum_name"` command to expand the nested array',
  '💡 You can prefix each line with # to mark that as a comment',
];

export const UQLEditor = (props: { mode: EditorMode; query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, mode, onChange, onRunQuery } = props;
  const LABEL_WIDTH = mode === 'variable' ? 10 : 8;
  const onUQLChange = (uql: string) => {
    if (query.type === 'uql') {
      onChange({ ...query, uql });
      onRunQuery();
    }
  };
  const handleMount = (editor: any) => registerUQL(editor);
  const getUQLSuggestions = (): CodeEditorSuggestionItem[] => {
    return [
      ...UQLKeyWords.map((item: string) => ({ label: item, kind: CodeEditorSuggestionItemKind.Method })),
      ...UQLFunctions.map((item: string) => ({ label: item, kind: CodeEditorSuggestionItemKind.Method })),
    ];
  };
  return query.type === 'uql' ? (
    <>
      <div className="gf-form">
        <InlineFormLabel className="query-keyword" width={LABEL_WIDTH}>
          UQL
        </InlineFormLabel>
        <div>
          <CodeEditor
            language="sql"
            width="594px"
            height="140px"
            value={query.uql}
            showMiniMap={false}
            showLineNumbers={false}
            getSuggestions={getUQLSuggestions}
            onSave={onUQLChange}
            onBlur={onUQLChange}
            onEditorDidMount={handleMount}
          />
          <p style={{ paddingBlock: '5px', color: 'yellowgreen' }}>{UQLTips[Math.floor(Math.random() * UQLTips.length)]}</p>
        </div>
        <div title="Alternatively, you can also press ctrl+s ">
          <Icon
            name="play"
            size="lg"
            style={{ color: 'greenyellow' }}
            onClick={() => {
              onRunQuery();
            }}
          />
        </div>
      </div>
    </>
  ) : (
    <></>
  );
};

async function registerUQL(editor: any) {
  try {
    editor.updateOptions({ fixedOverflowWidgets: true });
    const allLangs = monaco.languages.getLanguages();
    const { language: uqlLang } = await allLangs.find(({ id }: any) => id === 'sql').loader();
    if (!uqlLang.hasOwnProperty('keywords')) {
      uqlLang.keywords = [];
    }
    uqlLang.keywords.unshift.apply(uqlLang.keywords, UQLKeyWords);
    if (!uqlLang.hasOwnProperty('builtinFunctions')) {
      uqlLang.builtinFunctions = [];
    }
    uqlLang.builtinFunctions.unshift.apply(uqlLang.builtinFunctions, UQLFunctions);
  } catch (ex) {
    console.log('error while loading monaco editor', ex);
  }
}

const UQLKeyWords = ['parse-json', 'parse-csv', 'parse-xml', 'parse-yaml', 'project', 'project-away', 'project kv()', 'jsonata', 'extend', 'scope', 'summarize', 'mv-expand', 'order by', 'where'];
const UQLFunctions = [
  'count',
  'sum',
  'diff',
  'mul',
  'div',
  'min',
  'max',
  'mean',
  'first',
  'last',
  'latest',
  'countif',
  'sumif',
  'minif',
  'maxif',
  'strcat',
  'dcount',
  'distinct',
  'random',
  'kv',
  'toupper',
  'tolower',
  'strlen',
  'trim',
  'trim_start',
  'trim_end',
  'toint',
  'tolong',
  'tonumber',
  'tobool',
  'tostring',
  'todouble',
  'tofloat',
  'parse_url',
  'parse_urlquery',
  'todatetime',
  'tounixtime',
  'unixtime_seconds_todatetime',
  'unixtime_nanoseconds_todatetime',
  'unixtime_milliseconds_todatetime',
  'unixtime_microseconds_todatetime',
  'format_datetime',
  'add_datetime',
  'startofminute',
  'startofhour',
  'startofday',
  'startofmonth',
  'startofweek',
  'startofyear',
];
