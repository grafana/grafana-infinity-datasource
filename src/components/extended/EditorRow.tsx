import { css } from '@emotion/css';
import React, { useState } from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, Button } from '@grafana/ui';
import { Stack } from './Stack';

interface EditorRowProps {
  label: string;
  collapsible?: boolean;
  title?: () => string | React.ReactNode;
  collapsed?: boolean;
  dataTestId?: string;
  children: React.ReactNode;
}

export const EditorRow: React.FC<EditorRowProps> = ({ label, collapsible, collapsed = true, title, dataTestId, children }) => {
  const styles = useStyles2(getStyles);
  const [show, setShow] = useState(collapsed);
  const testId = (compType = '') => `infinity-query-row${compType ? '-' + compType : ''}-${(dataTestId || label).replace(/\ /g, '-')}`.toLowerCase();
  return (
    <div className={styles.root} data-testid={testId('wrapper')}>
      {collapsible && (
        <>
          <Button
            icon={show ? 'angle-down' : 'angle-right'}
            fill="text"
            size="sm"
            variant="secondary"
            onClick={(e) => {
              setShow(!show);
              e.preventDefault();
            }}
            style={{ marginRight: '10px' }}
            data-testid={testId(`collapse-${show ? 'hide' : 'show'}`)}
          />
          <span
            onClick={(e) => {
              setShow(!show);
              e.preventDefault();
            }}
            data-testid={testId(`title`)}
          >
            <b className={styles.collapseTile}>{label}</b>
          </span>
          <span className={styles.collapseTileSecondary}>{title ? title() : 'Options'}</span>
        </>
      )}
      {show && (
        <div style={{ display: 'flex', marginTop: label && collapsible ? '15px' : '0px', marginLeft: '0px' }} data-testid={testId(`children`)}>
          {children}
        </div>
      )}
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
    collapseTile: css({
      marginRight: theme.spacing(1),
      color: theme.colors.secondary.text,
    }),
    collapseTileSecondary: css({
      color: theme.colors.text.secondary,
      fontSize: theme.typography.bodySmall.fontSize,
      '&:hover': {
        color: theme.colors.secondary.text,
      },
    }),
  };
};

interface EditorRowsProps {
  children: React.ReactNode;
}

export const EditorRows: React.FC<EditorRowsProps> = ({ children }) => {
  return (
    <Stack gap={0.5} direction="column">
      {children}
    </Stack>
  );
};
