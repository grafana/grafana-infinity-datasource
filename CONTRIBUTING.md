# Contributing

## Signed commits are required

> [!IMPORTANT]
> All commits must be [signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits) (GPG, SSH, or S/MIME) to be merged into this repository. Pull requests with unsigned commits will need to be re-committed with signatures before they can be merged.


If you want to contribute to the plugin, you can contribute in one of the following ways

- [Test different APIs](https://github.com/grafana/grafana-infinity-datasource/discussions/categories/specific-apis) and create bugs if not working as expected
- If you find any interesting APIs, [showcase](https://github.com/grafana/grafana-infinity-datasource/discussions/categories/show-and-tell) how you are using the API with Infinity datasource so that other community members will get benefit out of it.

## Setting up locally for development

You need following tools in your local machine for development

- NodeJS v24.0+
- Go 1.26
- Mage

Once you clone the repo locally in the grafana's plugin folder. Do the following steps

- `yarn` - This will install the frontend dependencies. Do this once
- `yarn test` - To make sure all the existing tests passed
- `go test -v ./...` - To make sure all the backend tests passed
- `yarn dev` - For continuously watching the front-end changes and build
- `yarn build` - For building the frontend components
- `mage -v` - This will help to build the backend part of the plugin. Do this once if you are contributing only the frontend. There is no significant code is in the backend. So no much changes expected
- `docker-compose up` - To run the plugin with grafana locally. ( use infinity:infinity as the credentials ). You can also enable traces and logs with debug mode. Refer the **Setting up grafana in debug mode** section below

## Dependencies

Note that some packages have no direct `import` in `src/` but are still required:

- **`@openfeature/web-sdk`** — required by Grafana's feature toggle system. Even though the plugin does not import it directly, removing it might breaks feature flag evaluation at runtime, so we keep it.

## Data Source Configuration Schema

`pkg/schema/dsconfig.json` is the **single source of truth** for the data source's
configuration surface — every field a user can set, where it is stored (`root`,
`jsonData`, `secureJsonData`), its type, validation rules and UI hints. It is consumed by
provisioning tooling, documentation and automation.

The schema format is defined and documented by [`grafana/dsconfig`](https://github.com/grafana/dsconfig/tree/main/dsconfig):

- [README](https://github.com/grafana/dsconfig/tree/main/dsconfig#readme) — concepts and a worked example for each field shape (root / jsonData / secret / array / virtual), plus current gaps and limitations.
- [`schema.md`](https://github.com/grafana/dsconfig/blob/main/dsconfig/schema.md) — full property reference.
- [`schema.json`](https://github.com/grafana/dsconfig/blob/main/dsconfig/schema.json) — the JSON Schema `dsconfig.json` validates against. It is pinned via the `$schema` key at the top of our file, so editors autocomplete from it; bump that URL when you bump `github.com/grafana/dsconfig/schema` in `go.mod`.

The rest of this section covers only what is specific to this repository.

### Layout

| File in `pkg/schema/` | Description |
| --------------------- | ----------- |
| `dsconfig.json` | Source of truth — **edit this** |
| `dsconfig_test.go` | Wires the schema into the shared conformance suite; also holds `SecureKeys` |
| `*.gen.json` | Generated artifacts — **never hand-edit**; `npm run build` copies them into `dist/schema/` via `webpack.config.ts` |

### Adding a new settings option

1. **Declare the field** in `pkg/schema/dsconfig.json` under `fields`, and add its `id` to
   the appropriate `groups[].fieldRefs` entry. Field ids follow the `<target>_<key>`
   convention, e.g. `jsonData_authMethod`.
2. **Add the matching Go field** to `InfinitySettingsJson` in `pkg/models/settings.go` with a json tag equal
   to the schema `key`. This parity is enforced in both directions — a field in the schema
   but not the struct (or vice versa) fails the test suite. Secrets
   (`target: secureJsonData`) are the exception: they get no struct field, but their key
   must be added to `SecureKeys` in `pkg/schema/dsconfig_test.go`.
3. **Regenerate the artifacts** and commit them with your change:

   ```bash
   go generate ./pkg/schema/...
   ```

4. **Verify**:

   ```bash
   go test ./pkg/schema/...
   ```

This repo does not ship provisioning examples yet, so `settings.examples.gen.json` is
empty. To add them, set `SettingsExamples` on the `schema.PluginUnderTest` value in
`pkg/schema/dsconfig_test.go` — one worked configuration per auth type is the usual
shape. Use placeholders like `REPLACE_WITH_PASSWORD`, never real credentials.

### When the conformance suite fails

Most failures are self-explanatory from the assertion message. The three you are most
likely to hit:

- `SchemaArtifactInSync` — a `.gen.json` file has drifted. Run `go generate ./pkg/schema/...` and commit the result.
- `JSONDataMatchesStruct` / `JSONDataTypesMatchStruct` — the schema and `InfinitySettingsJson` disagree on keys or types. Update whichever side is behind.
- `SecureValuesMatchLoadSettings` — the schema's `secureJsonData` fields and `SecureKeys` disagree.

## Submitting PR

If you are creating a PR, ensure to run `yarn changeset` from your branch. Provide the details accordingly. It will create `*.md` file inside `./.changeset` folder. Later during the release, based on these changesets, package version will be bumped and changelog will be generated.

## Releasing & Bumping version

To create a new release, execute `yarn changeset version`. This will update the Changelog and bump the version in `package.json` file. Commit those changes.

## Setting up grafana in debug mode

- Ensure the loki docker plugin is installed `docker plugin install grafana/loki-docker-driver:2.9.1 --alias loki --grant-all-permissions`
- Start the docker from debug file `docker compose -f docker-compose-debug.yaml up`

## Testing the PDC

To test the PDC functionality with Infinity, you can use the `docker compose -f docker-compose-debug.yaml up`. This debug docker compose file comes with **microsocks** proxy, PDC enabled and configured. [Provisioned datasources](./provisioning/datasources/default.yml) file also have some examples of datasource instances with secure socks proxy enabled and with different authentication mechanisms.(You can find the PDC enabled datasources with the prefix **PDC**.)
