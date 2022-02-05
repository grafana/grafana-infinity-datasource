import React from 'react';

export const InspiringStory = () => {
  return (
    <div>
      <div className="text-center p-24" style={{ backgroundColor: 'rgba(0,100,100,0.2)' }}>
        <h2 className="text-6xl font-thin text-teal-100 my-8">Got an inspiring story about Infinity to share?</h2>
        <p>
          If you have an inspiring story about infinity to tell us, write{' '}
          <a className="text-teal-200" href="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/new?category=show-and-tell" target="_blank" rel="noreferrer">
            here in the github discussion
          </a>
          .
        </p>
      </div>
    </div>
  );
};
