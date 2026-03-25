---
description: Create a release by consuming changesets, bumping the version in package.json, and updating the CHANGELOG.
on:
  workflow_dispatch:
permissions:
  contents: read
  pull-requests: read
  issues: read
tools:
  github:
    toolsets: [default]
network:
  allowed:
    - defaults
    - node
safe-outputs:
  create-pull-request:
    max: 1
---

# Create Release

You are an AI agent responsible for preparing a new release for the `grafana-infinity-datasource` plugin. Your job is to consume pending changesets, bump the version in `package.json`, update the `CHANGELOG.md`, and open a pull request with the changes.

## Context

This repository uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs. Changeset entries are markdown files in the `.changeset/` directory (excluding `README.md`, `config.json`, and `changelog.js`). The project uses Yarn (v4) as its package manager.

The changelog uses a custom formatter (`.changeset/changelog.js`) that produces emoji-prefixed entries:
- 🎉 for major changes
- 🚀 for minor changes
- 🐛 for patch changes
- 📝 for documentation changes (when summary contains "Docs")
- ⚙️ for chores (when summary contains "Chore", "grafana-plugin-sdk-go", or "compiled")

## Your Task

### Step 1: Check for pending changesets

Look in the `.changeset/` directory for any pending changeset markdown files. These are `.md` files that are **not** `README.md`. Files like `config.json` and `changelog.js` are configuration and should be ignored.

```bash
find .changeset -maxdepth 1 -name '*.md' ! -name 'README.md' -type f
```

### Step 2: Create a changeset if none exist

If **no** pending changeset files were found in Step 1, create one for a maintenance/patch release:

```bash
cat > .changeset/maintenance-release.md << 'EOF'
---
'grafana-infinity-datasource': patch
---

maintenance release
EOF
```

### Step 3: Install dependencies

Run `yarn install` to ensure all dependencies (including `@changesets/cli`) are available:

```bash
yarn install
```

### Step 4: Consume changesets and bump the version

Run the changeset version command to consume all pending changesets, bump the version in `package.json`, and update `CHANGELOG.md`:

```bash
yarn changeset version
```

This will:
- Remove the consumed changeset `.md` files from `.changeset/`
- Update the version in `package.json`
- Prepend the new release entry to `CHANGELOG.md` using the custom emoji formatter

### Step 5: Verify the changes

Confirm that the expected files were modified:

```bash
git diff --name-only
```

You should see changes in at least:
- `package.json` (version bump)
- `CHANGELOG.md` (new release entry)
- `.changeset/` (consumed changeset files removed)

Review the `CHANGELOG.md` to verify the new entry follows the existing format with emoji prefixes and version headers.

### Step 6: Create a pull request

Create a pull request with the version bump and changelog updates. Use the `create-pull-request` safe output with:

- **title**: `Release v<new-version>` (read the new version from `package.json`)
- **branch**: `release/v<new-version>`
- **body**: Include the new CHANGELOG entry for this version in the PR description
- **base**: `main`

Stage and commit all changed files before creating the PR:

```bash
git checkout -b release/v<new-version>
git add package.json CHANGELOG.md .changeset/
git commit -m "Release v<new-version>"
```

## Guidelines

- Do **not** modify any files other than what `yarn changeset version` changes plus the optional maintenance changeset.
- Do **not** run `yarn build` or any other build commands.
- Ensure the CHANGELOG entry is consistent with existing entries in `CHANGELOG.md`.
- If `yarn changeset version` fails, report the error clearly.
- If there was nothing to be done (which should not happen in this workflow since we create a changeset if none exist), call the `noop` safe output explaining why.
