#!/bin/sh
PRE_RELEASE_TAG=0.0.0-x
echo "Publishing pre release - "$PRE_RELEASE_TAG.$1;
yarn install --frozen-lockfile;
yarn audit-ci;
yarn spellcheck;
yarn build;
go test -v ./...
mage -v
yarn sign
export GRAFANA_PLUGIN_ID=$(cat dist/plugin.json | jq -r .id)
export GRAFANA_PLUGIN_VERSION=$(cat dist/plugin.json | jq -r .info.version)
export GRAFANA_PLUGIN_TYPE=$(cat dist/plugin.json | jq -r .type)
export GRAFANA_PLUGIN_ARTIFACT=${GRAFANA_PLUGIN_ID}-${GRAFANA_PLUGIN_VERSION}-$1.zip
export GRAFANA_PLUGIN_ARTIFACT_CHECKSUM=${GRAFANA_PLUGIN_ARTIFACT}.md5
zip -r $GRAFANA_PLUGIN_ARTIFACT ./dist/
gh release upload $PRE_RELEASE_TAG $GRAFANA_PLUGIN_ARTIFACT
rm $GRAFANA_PLUGIN_ARTIFACT
exit 0;