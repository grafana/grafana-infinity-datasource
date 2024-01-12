import React, { useState } from 'react';
import { FileDropzone, LinkButton, Button, InlineFormLabel, Input } from '@grafana/ui';
import type { DataSourceSettings } from '@grafana/data';
import type { InfinityOptions } from './../../../types';

type GoogleJWTEditorProps = {
  options: DataSourceSettings<InfinityOptions, {}>;
  onChange: (options: DataSourceSettings<InfinityOptions, {}>) => void;
  children?: React.ReactChild;
  moreLink?: string;
};

export const GoogleJWTEditor = (props: GoogleJWTEditorProps) => {
  const { options, onChange: onOptionsChange } = props;
  const [jwt, setJwt] = useState<any>(null);
  const [scopes, setScopes] = useState<string>((options?.jsonData?.oauth2?.scopes || []).join(''));
  return (
    <>
      <div className="gf-form">
        <FileDropzone
          options={{ multiple: false }}
          onLoad={(result) => {
            try {
              const json = JSON.parse(result as string);
              setJwt(json);
            } catch (ex) {
              setJwt(null);
            }
          }}
        />
      </div>
      {(scopes !== '' || jwt !== null) && (
        <div className="gf-form">
          <InlineFormLabel width={10} tooltip="Scopes optionally specifies a list of requested permission scopes. Enter comma separated values">
            Scopes
          </InlineFormLabel>
          <Input onChange={(e) => setScopes(e.currentTarget.value)} value={scopes} placeholder={'Comma separated values of scopes'} />
        </div>
      )}
      {props.children}
      <div style={{ textAlign: 'center', width: '100%', marginBlock: '20px' }}>
        {props.moreLink && (
          <LinkButton href={props.moreLink} target="_blank" variant={'secondary'} icon="question-circle">
            More details
          </LinkButton>
        )}
        <Button
          style={{ marginInline: '10px' }}
          onClick={() => {
            if (jwt !== null) {
              onOptionsChange({
                ...options,
                jsonData: {
                  ...options.jsonData,
                  auth_method: 'oauth2',
                  oauth2: {
                    oauth2_type: 'jwt',
                    email: jwt['client_email'] || '',
                    private_key_id: jwt['private_key_id'],
                    token_url: jwt['token_uri'],
                    scopes: scopes.split(','),
                  },
                },
                secureJsonData: {
                  ...options.secureJsonData,
                  oauth2JWTPrivateKey: jwt['private_key'],
                },
                secureJsonFields: {
                  ...options.secureJsonFields,
                  oauth2JWTPrivateKey: true,
                },
              });
            }
          }}
        >
          Update
        </Button>
      </div>
    </>
  );
};
