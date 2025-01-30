import { css } from '@emotion/css';
import React, { ComponentProps } from 'react';
import { stylesFactory, useTheme2, ReactUtils, Field, Icon, PopoverContent, Tooltip, Tag, Stack, Space } from '@grafana/ui';
import type { GrafanaTheme2 } from '@grafana/data';

export const EditorFieldGroup: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <Stack gap={1}>{children}</Stack>;
};

interface EditorFieldProps extends ComponentProps<typeof Field> {
  label: string;
  children: React.ReactElement;
  promoNode?: React.ReactNode;
  width?: number | string;
  optional?: boolean;
  tooltip?: PopoverContent;
  invalid?: boolean;
  tag?: string;
  dataTestId?: string;
  borderColor?: string;
  horizontal?: boolean;
}

export const EditorField: React.FC<EditorFieldProps> = (props) => {
  const { label, optional, tooltip, children, promoNode, width, invalid, borderColor, tag, dataTestId, horizontal, ...fieldProps } = props;

  const theme = useTheme2();
  const styles = getStyles(theme, width, invalid ? 'red' : borderColor, horizontal);

  // Null check for backward compatibility
  const childInputId = fieldProps?.htmlFor || ReactUtils?.getChildId(children);
  const testId = (compType = '') => `infinity-query-field${compType ? '-' + compType : ''}-${(dataTestId || label).replace(/ /g, '-')}`.toLowerCase();

  const labelEl = (
    <>
      <label className={styles.label} htmlFor={childInputId} data-testid={testId('label')}>
        {label}
        {tag && <Tag name={tag} className={styles.tag} colorIndex={10} />}
        {optional && <span className={styles.optional}> - optional</span>}
        {promoNode}
        {tooltip && (
          <Tooltip placement="top" content={tooltip} theme="info">
            <Icon name="info-circle" size="sm" className={styles.icon} />
          </Tooltip>
        )}
      </label>
      <Space v={0.5} />
    </>
  );

  if (horizontal) {
    return (
      <div className={styles.root} data-testid={testId('wrapper')}>
        <Field className={styles.field} label={labelEl} {...fieldProps} horizontal={true}>
          {children}
        </Field>
      </div>
    );
  }

  return (
    <div className={styles.root} data-testid={testId('wrapper')}>
      <Field className={styles.field} label={labelEl} {...fieldProps}>
        {children}
      </Field>
    </div>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme2, width?: number | string, borderColor = 'transparent', horizontal = false) => {
  return {
    root: css({
      minWidth: theme.spacing(width ?? 0),
      // boxShadow: `0px 0px 4px 0px ${theme.colors.border.weak}`,
      border: `1px solid ${theme.colors.border.medium}`,
      padding: theme.spacing('8px'),
      background: theme.colors.background.primary,
      // marginRight: horizontal ? '10px' : '5px',
    }),
    label: css({
      fontSize: theme.typography.bodySmall.fontSize,
      fontWeight: theme.typography.fontWeightMedium,
      paddingLeft: '1px',
      border: horizontal ? `1px solid ${borderColor}` : '',
      padding: horizontal ? '5px 10px 5px 0px' : '',
      textAlign: horizontal ? 'right' : 'left',
    }),
    tag: css({
      marginLeft: '10px',
    }),
    optional: css({
      fontStyle: 'italic',
      color: theme.colors.text.secondary,
    }),
    field: css({
      marginBottom: 0, // GrafanaUI/Field has a bottom margin which we must remove
      marginRight: '0px',
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
