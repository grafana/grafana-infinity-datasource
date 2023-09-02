import { InlineFormLabel, Modal, Select } from '@grafana/ui';
import React, { useState } from 'react';
import { GuidedBasicAuthEditor } from './guided-config/GuidedBasicAuthEditor';
import { GoogleJWTEditor } from './guided-config/GoogleJWT';
import type { InfinityOptions } from './../../types';
import type { DataSourceSettings, SelectableValue } from '@grafana/data';

export const OthersAuthentication = (props: {
  options: DataSourceSettings<InfinityOptions, {}>;
  onOptionsChange: (options: DataSourceSettings<InfinityOptions, {}>) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [provider, setProvider] = useState('Other');
  const providers: Array<SelectableValue<string>> = [
    { label: 'Github', value: 'github' },
    { label: 'Google JWT', value: 'google-jwt' },
  ];
  const { options, onOptionsChange, isOpen, onClose } = props;
  const onChange = (o: DataSourceSettings<InfinityOptions, {}>) => {
    onOptionsChange(o);
    onClose();
  };
  return (
    <>
      <Modal title="Other Authentication" isOpen={isOpen} onDismiss={onClose}>
        <div className="gf-form">
          <InlineFormLabel width={12}>Provider</InlineFormLabel>
          <Select value={provider} options={providers} onChange={(e) => setProvider(e?.value!)} isClearable={true} menuShouldPortal={true}></Select>
        </div>
        {provider === 'github' && (
          <GuidedBasicAuthEditor
            options={options}
            onChange={onChange}
            provider="Github"
            allowedHosts={['https://api.github.com']}
            usernameLabel="Username"
            usernamePlaceholder="(optional) Github username"
            usernameTooltip="Github username"
            passwordLabel="Token"
            passwordPlaceholder="Github personal access token"
            passwordTooltip="Github token / personal access token"
            moreLink="https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api#authentication"
          />
        )}
        {provider === 'google-jwt' && <GoogleJWTEditor options={options} onChange={onChange} />}
      </Modal>
    </>
  );
};
