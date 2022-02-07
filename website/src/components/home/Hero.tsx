import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';
import { TypeWriter } from './TypeWriter';

export const HeroSection = () => {
  const [hasRan, setHasRan] = useState(false);
  const [screenSize, setScreenSize] = useState({ height: 0, width: 0 });
  useEffect(() => {
    if (!hasRan) {
      setHasRan(true);
      updateScreenSize();
    }
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [screenSize, hasRan]);
  const updateScreenSize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setScreenSize({ width, height });
  };
  return (
    <div style={{ width: '100%', height: `${screenSize.height - 40}px` }} className="flex flex-col place-content-center p-10">
      <h1 className="font-bold text-4xl mb-10">
        <TypeWriter />
      </h1>
      <p className="font-lighter my-10">Visualize data from JSON, CSV, XML, GraphQL, HTML &amp; REST APIs. Also turns any website into grafana dashboard.</p>
      <div className="mt-10">
        <Link className="p-3 mr-6 rounded border" to="/getting-started">
          Getting started
        </Link>
        <Link className={`p-3 mr-6 rounded border`} to="/blog">
          Blog
        </Link>
        <a className={`p-3 mr-6 rounded border`} href="https://grafana-infinity-datasource.herokuapp.com/d/try/try?orgId=1&editPanel=2" target="_blank" rel="noreferrer">
          Try online
        </a>
      </div>
    </div>
  );
};
