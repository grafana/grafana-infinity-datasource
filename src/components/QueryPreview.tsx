import React, { useState } from 'react';
import { Modal, Button, CodeEditor } from '@grafana/ui';

export const QueryPreview = (props: { query: string }) => {
  const { query } = props;
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button
        variant="secondary"
        size="sm"
        icon="code-branch"
        style={{ margin: '5px' }}
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
      >
        Query Preview
      </Button>
      <Modal isOpen={open} title="Query Preview" onDismiss={() => setOpen(false)}>
        <CodeEditor value={query} readOnly={true} language="json" height="400px" />
        <br />
        <Button variant="primary" size="md" onClick={() => setOpen(false)}>
          OK
        </Button>
      </Modal>
    </div>
  );
};
