import { css } from '@emotion/css';
import React from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { stylesFactory, useTheme2 } from '@grafana/ui';

export const EditorHeader: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const theme = useTheme2();
  const styles = getStyles(theme);

  return <div className={styles.root}>{children}</div>;
};

const getStyles = stylesFactory((theme: GrafanaTheme2) => ({
  root: css({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(3),
    minHeight: theme.spacing(4),
  }),
}));
