import React from 'react';

export const Badges = () => {
  return (
    <p className="text-center my-4">
      <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/actions?query=workflow%3A%22Build+%26+Publish%22" target="_blank" className="mx-2" rel="noreferrer">
        <img src="https://github.com/yesoreyeram/grafana-infinity-datasource/workflows/Build%20&%20Publish/badge.svg" />
      </a>
      <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/issues" target="_blank" className="mx-2" rel="noreferrer">
        <img src="https://img.shields.io/github/issues/yesoreyeram/grafana-infinity-datasource" />
      </a>
      <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/blob/main/LICENSE" target="_blank" className="mx-2" rel="noreferrer">
        <img src="https://img.shields.io/github/license/yesoreyeram/grafana-infinity-datasource" alt="Grafana Infinity data source license" />
      </a>
      <a href="http://makeapullrequest.com" className="mx-2">
        <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs are welcome" />
      </a>
      <a href="https://GitHub.com/yesoreyeram/grafana-infinity-datasource/graphs/commit-activity" className="mx-2">
        <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Grafana Infinity datasource is maintained" />
      </a>
    </p>
  );
};
