# Contributing

If you want to contribute to the plugin, you can contribute in one of the following ways

- [Test different APIs](https://github.com/grafana/grafana-infinity-datasource/discussions/categories/specific-apis) and create bugs if not working as expected
- If you find any interesting APIs, [showcase](https://github.com/grafana/grafana-infinity-datasource/discussions/categories/show-and-tell) how you are using the API with Infinity datasource so that other community members will get benefit out of it.

## Setting up locally for development

You need following tools in your local machine for development

- NodeJS v20.0+
- Go 1.22
- Mage

Once you clone the repo locally in the grafana's plugin folder. Do the following steps

- `yarn` - This will install the frontend dependencies. Do this once
- `yarn test` - To make sure all the existing tests passed
- `go test -v ./...` - To make sure all the backend tests passed
- `yarn dev` - For continuously watching the front-end changes and build
- `yarn build` - For building the frontend components
- `mage -v` - This will help to build the backend part of the plugin. Do this once if you are contributing only the frontend. There is no significant code is in the backend. So no much changes expected
- `docker-compose up` - To run the plugin with grafana locally. ( use infinity:infinity as the credentials ). You can also enable traces and logs with debug mode. Refer the **Setting up grafana in debug mode** section below

## Submitting PR

If you are creating a PR, ensure to run `yarn changeset` from your branch. Provide the details accordingly. It will create `*.md` file inside `./.changeset` folder. Later during the release, based on these changesets, package version will be bumped and changelog will be generated.

## Releasing & Bumping version

To create a new release, execute `yarn changeset version`. This will update the Changelog and bump the version in `package.json` file. Commit those changes.

## Setting up grafana in debug mode

- Ensure the loki docker plugin is installed `docker plugin install grafana/loki-docker-driver:2.9.1 --alias loki --grant-all-permissions`
- Start the docker from debug file `docker compose -f docker-compose-debug.yaml up`

## Testing the PDC

To test the PDC functionality with Infinity, you can use the `docker compose -f docker-compose-debug.yaml up`. This debug docker compose file comes with **microsocks** proxy, PDC enabled and configured. [Provisioned datasources](./provisioning/datasources/default.yml) file also have some examples of datasource instances with secure socks proxy enabled and with different authentication mechanisms.(You can find the PDC enabled datasources with the prefix **PDC**.)
