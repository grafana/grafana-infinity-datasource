import { css } from '@emotion/css';
import React, { useState } from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, Icon } from '@grafana/ui';
import { Stack } from './Stack';

interface EditorRowProps {
  collapsible?: boolean;
  title?: () => string;
}

export const EditorRow: React.FC<EditorRowProps> = ({ collapsible, title, children }) => {
  const styles = useStyles2(getStyles);
  const [show, setShow] = useState(true);
  return (
    <div className={styles.root}>
      <Stack gap={2}>
        {collapsible && (
          <>
            <Icon name={show ? 'angle-down' : 'angle-right'} style={{ marginBlockStart: '5px' }} onClick={() => setShow(!show)} />
            {title && !show && <>{title()}</>}
          </>
        )}
        {show && <>{children}</>}
      </Stack>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    root: css({
      padding: theme.spacing(1),
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.shape.borderRadius(1),
    }),
  };
};

interface EditorRowsProps {}

export const EditorRows: React.FC<EditorRowsProps> = ({ children }) => {
  return (
    <Stack gap={0.5} direction="column">
      {children}
    </Stack>
  );
};
