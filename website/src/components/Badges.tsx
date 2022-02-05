import React from 'react';

export const Badges = () => {
  const badges = [
    {
      link: 'https://github.com/yesoreyeram/grafana-infinity-datasource/actions?query=workflow%3A%22Build+%26+Publish%22',
      imgSrc: 'https://github.com/yesoreyeram/grafana-infinity-datasource/workflows/Build%20&%20Publish/badge.svg',
    },
    {
      link: 'https://github.com/yesoreyeram/grafana-infinity-datasource/issues',
      imgSrc: 'https://img.shields.io/github/issues/yesoreyeram/grafana-infinity-datasource',
    },
    {
      link: 'https://github.com/yesoreyeram/grafana-infinity-datasource/blob/main/LICENSE',
      imgSrc: 'https://img.shields.io/github/license/yesoreyeram/grafana-infinity-datasource',
    },
    {
      link: 'http://makeapullrequest.com',
      imgSrc: 'https://img.shields.io/badge/PRs-welcome-brightgreen.svg',
    },
    {
      link: 'https://GitHub.com/yesoreyeram/grafana-infinity-datasource/graphs/commit-activity',
      imgSrc: 'https://img.shields.io/badge/Maintained%3F-yes-green.svg',
    },
  ];
  return (
    <p className="text-center my-4">
      {badges.map((b, i) => {
        return (
          <a href={b.link} target="_blank" className="mx-2" rel="noreferrer" key={i}>
            <img src={b.imgSrc} />
          </a>
        );
      })}
    </p>
  );
};
