import React from 'react';
import { Select as OriginalSelect } from '@grafana/ui';

// TODO: Change this to Select from @grafana/ui once the dependencies updated to 8.3.0+
// This is a workaround to support menuShouldPortal prop introduced in 8.x of grafana
export const Select = (props: React.ComponentProps<typeof OriginalSelect> & { menuShouldPortal?: boolean }) => {
  return <OriginalSelect {...props} />;
};
