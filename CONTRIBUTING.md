# Contributing

If you want to contribute to the plugin, you can contribute in one of the following ways

- [Test different APIs](https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/categories/specific-apis) and create bugs if not working as expected
- If you find any interesting APIs, [showcase](https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/categories/show-and-tell) how you are using the API with Infinity datasource so that other community members will get benefit out of it.

## Setting up locally for development

You need following tools in your local machine for development

- NodeJS v16.0+
- Go 1.20
- Mage

Once you clone the repo locally in the grafana's plugin folder. Do the following steps

- `yarn` - This will install the frontend dependencies. Do this once
- `yarn watch` - For continuously watching the front-end changes and build
- `mage -v` - This will help to build the backend part of the plugin. Do this once if you are contributing only the frontend. There is no significant code is in the backend. So no much changes expected
- `docker-compose up` - To run the plugin with grafana locally. ( use infinity:infinity as the credentials )
- `yarn test` - To make sure all the existing tests passed

## Setting up the plugin docs site locally

- `cd website & yarn dev` - To build and see the changes of docs website
- `cd website & yarn build` - To build the docs website

## Submitting PR

If you are creating a PR, ensure to run `yarn changeset` from your branch. Provide the details accordingly. It will create `*.md` file inside `./.changeset` folder. Later during the release, based on these changesets, package version will be bumped and changelog will be generated.

## Releasing & Bumping version

To create a new release, execute `yarn changeset version`. This will update the Changelog and bump the version in `package.json` file. Commit those changes and then create a release tag by executing `git tag v1.4.1`. Then you can push the commit and tag by executing `git push && git push --tags`
