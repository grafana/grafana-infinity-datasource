---
description: "Use when writing or modifying frontend tests. Covers Jest, React Testing Library, selectors, mocking, and query/settings construction patterns."
applyTo: "src/**/*.{test,spec}.{ts,tsx}"
---
# Frontend Test Conventions

## Imports

```tsx
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Components } from '@/selectors';
import { DefaultInfinityQuery } from '@/constants';
import type { InfinityQuery } from '@/types';
```

Use the `@/` path alias for all project imports.

## Router/UI Mocking

Tests rendering components that use Links need this mock block:

```tsx
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
```

## Callbacks and Cleanup

Use `jest.fn()` for all callbacks (`onChange`, `onRunQuery`, `onOptionsChange`). Clear mocks between tests:

```tsx
beforeEach(() => jest.clearAllMocks());
```

## Mock Data Construction

Use `Object.freeze()` on all mock props and queries to verify components don't mutate props:

```tsx
const mockQuery: InfinityQuery = Object.freeze({
  refId: 'A',
  type: 'json',
  source: 'url',
  url: 'http://example.com',
  parser: 'backend',
  columns: [],
  format: 'table' as InfinityQueryFormat,
  root_selector: '',
  url_options: {} as InfinityURLOptions,
});
```

For simple component tests, a quick cast is acceptable:

```tsx
const query = { type: 'json', columns: [{}] } as InfinityQuery;
```

## Selectors (Priority Order)

1. `data-testid` — `getByTestId('infinity-query-field-wrapper-type')`
2. Role with name — `getByRole('input', { name: ariaLabel })`
3. Text/display value — `screen.getByText(label)`, `getByDisplayValue(/^CSV$/)`
4. Placeholder/label — `getByPlaceholderText('Expression')`, `getByLabelText('Series Count')`

Use the `Components` selector object from `@/selectors` for centralized label strings when available.

## User Interactions

Prefer `userEvent` (async) over `fireEvent` (sync) in new tests:

```tsx
await userEvent.clear(input);
await userEvent.type(input, 'new value');
await userEvent.tab(); // trigger onBlur
await userEvent.click(button);
```

## Pure Function Tests

For parsers, UQL, GROQ, and migration logic — no DOM rendering needed:

```tsx
describe('parser', () => {
  it('should parse input correctly', () => {
    const result = parseFunction(input);
    expect(result).toStrictEqual(expected);
  });
});
```

## Test Co-location

Place test files next to their source files, not in a separate `__tests__/` directory.
