---
description: "Create a changeset file for the current changes. Use when: preparing a PR, documenting a bug fix, feature, or breaking change."
argument-hint: "Brief description of the change (e.g., 'Fix CSV parser for empty rows')"
agent: "agent"
---

Create a changeset file for the Infinity datasource plugin.

## Steps

1. **Determine what changed.** Look at the current git diff (`git diff` and `git diff --cached`) to understand the changes being made. If the user provided a description, use that as context.

2. **Choose the semver bump level:**
   - `patch` — Bug fixes, dependency updates, chore tasks
   - `minor` — New features, new query types, new auth methods
   - `major` — Breaking changes to query format, config schema, or API

3. **Write the summary.** One concise line describing the change. Use these prefixes when applicable to trigger the right changelog emoji:
   - Start with **"Docs"** for documentation-only changes (📝)
   - Start with **"Chore"** for maintenance/dependency updates (⚙️)
   - Otherwise, write a clear user-facing description (🐛 patch / 🚀 minor / 🎉 major)
   - Reference GitHub issues when relevant: `Fixes [#123](https://github.com/grafana/grafana-infinity-datasource/issues/123)`

4. **Create the file** at `.changeset/<random-name>.md` using this exact format:

```markdown
---
'grafana-infinity-datasource': <patch|minor|major>
---

<summary>
```

## Example outputs

Bug fix:
```markdown
---
'grafana-infinity-datasource': patch
---

Fix CSV parser crash when rows contain trailing delimiters. Fixes [#1500](https://github.com/grafana/grafana-infinity-datasource/issues/1500)
```

New feature:
```markdown
---
'grafana-infinity-datasource': minor
---

Add support for YAML data format in backend queries
```

Chore:
```markdown
---
'grafana-infinity-datasource': patch
---

Chore: update grafana-plugin-sdk-go to v0.291.0
```
