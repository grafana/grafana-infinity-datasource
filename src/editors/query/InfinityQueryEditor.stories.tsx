import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import { InfinityQueryEditor, InfinityEditorProps } from './infinityQuery';
import { DefaultInfinityQuery, EditorMode } from 'types';

export default {
  title: 'Query Editor',
  component: InfinityQueryEditor,
  argTypes: {},
} as Meta;

const Template: Story<InfinityEditorProps> = args => <InfinityQueryEditor {...args} />;

export const Default = Template.bind({});
Default.args = {
  mode: EditorMode.Standard,
  query: DefaultInfinityQuery,
  onChange: () => {},
  onRunQuery: () => {},
  instanceSettings: {},
};
