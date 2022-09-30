import { css } from '@emotion/css';
import React, { ComponentProps } from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { stylesFactory, useTheme2, ReactUtils, Field, Icon, PopoverContent, Tooltip } from '@grafana/ui';
import { Space } from './Space';
import { Stack } from './Stack';

export const EditorFieldGroup: React.FC<{}> = ({ children }) => {
  return <Stack gap={1}>{children}</Stack>;
};

interface EditorFieldProps extends ComponentProps<typeof Field> {
  label: string;
  children: React.ReactElement;
  width?: number | string;
  optional?: boolean;
  tooltip?: PopoverContent;
  invalid?: boolean;
}

export const EditorField: React.FC<EditorFieldProps> = (props) => {
  const { label, optional, tooltip, children, width, invalid, ...fieldProps } = props;

  const theme = useTheme2();
  const styles = getStyles(theme, width, invalid);

  // Null check for backward compatibility
  const childInputId = fieldProps?.htmlFor || ReactUtils?.getChildId(children);

  const labelEl = (
    <>
      <label className={styles.label} htmlFor={childInputId}>
        {label}
        {optional && <span className={styles.optional}> - optional</span>}
        {tooltip && (
          <Tooltip placement="top" content={tooltip} theme="info">
            <Icon name="info-circle" size="sm" className={styles.icon} />
          </Tooltip>
        )}
      </label>
      <Space v={0.5} />
    </>
  );

  return (
    <div className={styles.root}>
      <Field className={styles.field} label={labelEl} {...fieldProps}>
        {children}
      </Field>
    </div>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme2, width?: number | string, invalid = false) => {
  return {
    root: css({
      minWidth: theme.spacing(width ?? 0),
      paddingLeft: '5px',
      borderLeft: invalid ? '1px solid red' : '1px solid transparent',
    }),
    label: css({
      fontSize: 12,
      fontWeight: theme.typography.fontWeightMedium,
      paddingLeft: '5px',
    }),
    optional: css({
      fontStyle: 'italic',
      color: theme.colors.text.secondary,
    }),
    field: css({
      marginBottom: 0, // GrafanaUI/Field has a bottom margin which we must remove
      marginRight: '8px',
    }),
    icon: css({
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing(1),
      ':hover': {
        color: theme.colors.text.primary,
      },
    }),
  };
});
