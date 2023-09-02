import { Button, InlineFormLabel, Input, LinkButton } from '@grafana/ui';
import React, { useState } from 'react';
import type { InfinityOptions } from './../../../types';
import type { DataSourceSettings } from '@grafana/data';

type GuidedBasicAuthEditorProps = {
  options: DataSourceSettings<InfinityOptions, {}>;
  onChange: (options: DataSourceSettings<InfinityOptions, {}>) => void;

  provider: string;
  allowedHosts: string[];

  usernameTooltip?: string;
  usernameLabel?: string;
  usernamePlaceholder?: string;
  passwordTooltip?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  moreLink?: string;

  children?: React.ReactChild;
};

export const GuidedBasicAuthEditor = (props: GuidedBasicAuthEditorProps) => {
  const { options, onChange: onOptionsChange } = props;
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const LABEL_WIDTH = 12;
  return (
    <>
      <div className="gf-form">
        <InlineFormLabel width={LABEL_WIDTH} tooltip={props.usernameTooltip || 'username'}>
          {props.usernameLabel || 'Username'}
        </InlineFormLabel>
        <Input value={username} onChange={(e) => setUserName(e.currentTarget.value)} placeholder={props.usernamePlaceholder || 'username'} />
      </div>
      <div className="gf-form">
        <InlineFormLabel width={LABEL_WIDTH} tooltip={props.passwordTooltip || 'password'}>
          {props.passwordLabel || 'password'}
        </InlineFormLabel>
        <Input value={password} type="password" onChange={(e) => setPassword(e.currentTarget.value)} placeholder={props.passwordPlaceholder || 'password'} />
      </div>
      {props.children}
      <div style={{ textAlign: 'center', width: '100%', marginBlock: '20px' }}>
        {props.moreLink && (
          <LinkButton href={props.moreLink} target="_blank" variant={'secondary'} icon="question-circle">
            More details
          </LinkButton>
        )}
        <Button
          style={{ marginInline: '10px' }}
          onClick={() =>
            onOptionsChange({
              ...options,
              basicAuth: true,
              basicAuthUser: username || 'username',
              jsonData: {
                ...options.jsonData,
                auth_method: 'basicAuth',
                allowedHosts: props.allowedHosts,
              },
              secureJsonData: {
                ...options.secureJsonData,
                basicAuthPassword: password,
              },
            })
          }
        >
          Update
        </Button>
      </div>
    </>
  );
};
