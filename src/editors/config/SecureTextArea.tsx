import React, { ChangeEvent, MouseEvent } from 'react';
import { InlineFormLabel } from '@grafana/ui';

interface SecureTextAreaProps {
  label: string;
  labelWidth?: number;
  rows?: number;
  configured: boolean;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onReset: (event: MouseEvent<HTMLAnchorElement>) => void;
  onBlur?: () => void;
}

export const SecureTextArea = ({ configured, label, labelWidth, rows, onChange, onReset, onBlur, placeholder }: SecureTextAreaProps) => {
  return (
    <div className="gf-form-inline">
      <InlineFormLabel width={labelWidth || 8}>{label}</InlineFormLabel>
      {configured ? (
        <div className="gf-form">
          <input type="text" className={'gf-form-input max-width-12'} disabled value="configured" />
          <a className="btn btn-secondary gf-form-btn" onClick={onReset}>
            reset
          </a>
        </div>
      ) : (
        <div className="gf-form gf-form--grow">
          <textarea rows={rows || 5} className="gf-form-input gf-form-textarea" onChange={onChange} onBlur={onBlur} placeholder={placeholder} />
        </div>
      )}
    </div>
  );
};
