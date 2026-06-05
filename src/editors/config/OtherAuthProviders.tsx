import { InlineFormLabel, Modal, Combobox, type ComboboxOption } from '@grafana/ui';
import React, { useState } from 'react';
import { GoogleJWTEditor } from '@/editors/config/guided-config/GoogleJWT';
import type { InfinityOptions } from '@/types';
import type { DataSourceSettings } from '@grafana/data';

export const OthersAuthentication = (props: {
  options: DataSourceSettings<InfinityOptions, {}>;
  onOptionsChange: (options: DataSourceSettings<InfinityOptions, {}>) => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [provider, setProvider] = useState('google-jwt');
  const providers: Array<ComboboxOption<string>> = [
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
          <Combobox value={provider} options={providers} onChange={(e) => setProvider(e?.value!)} isClearable={true}></Combobox>
        </div>
        {provider === 'google-jwt' && <GoogleJWTEditor options={options} onChange={onChange} />}
      </Modal>
    </>
  );
};
