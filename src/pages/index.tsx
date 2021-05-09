import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';
import { Layout } from '../components/Layout';

export default function Home() {
  const [hasRan, setHasRan] = useState(false);
  const [screenSize, setScreenSize] = useState({
    height: 0,
    width: 0,
  });
  const updateScreenSize = () => {
    setScreenSize({ width: window.innerWidth, height: window.innerHeight });
  };
  useEffect(() => {
    if (!hasRan) {
      setHasRan(true);
      updateScreenSize();
    }
    window.addEventListener('resize', updateScreenSize);
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, [screenSize, hasRan]);
  return (
    <Layout showSubHeader={false}>
      <>
        <div
          className="position-relative overflow-hidden text-center"
          style={{
            width: '100%',
            height: `${screenSize.height - 56}px`,
            backgroundSize: 'cover',
            backgroundColor: '#021E40',
            backgroundImage: `url('https://play.grafana.org/public/img/login_background_dark.svg')`,
          }}
        >
          <div
            className="col-md-12 p-lg-5 mx-auto"
            style={{
              marginTop: `${screenSize.height / 4}px`,
            }}
          >
            <h1 className="display-4 fw-lighter text-white">Grafana Infinity Datasource</h1>
            <br />
            <p className="fw-normal text-white">Do infinite things with Grafana</p>
            <br />
            <Link
              className="btn btn-primary text-black"
              style={{ backgroundImage: 'linear-gradient(#FADE2A,#F05A28)', color: 'black', border: 'none' }}
              to="/features"
            >
              Get Started
            </Link>
          </div>
          <div className="product-device shadow-sm d-none d-md-block"></div>
          <div className="product-device product-device-2 shadow-sm d-none d-md-block"></div>
        </div>
        <p className="text-center my-4">
          <a
            href="https://github.com/yesoreyeram/grafana-infinity-datasource/actions?query=workflow%3A%22Build+%26+Publish%22"
            target="_blank"
            className="mx-2"
          >
            <img src="https://github.com/yesoreyeram/grafana-infinity-datasource/workflows/Build%20&%20Publish/badge.svg" />
          </a>
          <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/issues" target="_blank" className="mx-2">
            <img src="https://img.shields.io/github/issues/yesoreyeram/grafana-infinity-datasource" />
          </a>
          <a
            href="https://github.com/yesoreyeram/grafana-infinity-datasource/blob/master/LICENSE"
            target="_blank"
            className="mx-2"
          >
            <img
              src="https://img.shields.io/github/license/yesoreyeram/grafana-infinity-datasource"
              alt="Grafana Infinity data source license"
            />
          </a>
          <a href="http://makeapullrequest.com" className="mx-2">
            <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs are welcome" />
          </a>
          <a href="https://GitHub.com/yesoreyeram/grafana-infinity-datasource/graphs/commit-activity" className="mx-2">
            <img
              src="https://img.shields.io/badge/Maintained%3F-yes-green.svg"
              alt="Grafana Infinity datasource is maintained"
            />
          </a>
          <a
            href="https://codeclimate.com/github/yesoreyeram/grafana-infinity-datasource/maintainability"
            className="mx-2"
          >
            <img src="https://api.codeclimate.com/v1/badges/7e2ae1bce7310890065c/maintainability" />
          </a>
        </p>
      </>
    </Layout>
  );
}
