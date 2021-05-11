import React from 'react';
import { Link, navigate, useStaticQuery, graphql } from 'gatsby';

export const Features = () => {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            wallpaper
          }
        }
      }
    `
  );
  const patternImage = data.site.siteMetadata.wallpaper;
  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-sm-6 col-lg-6 mb-4">
          <div
            className="card p-3 text-center feature-card"
            style={{
              backgroundPosition: 'cover',
              backgroundPositionY: '20%',
              backgroundPositionX: '0%',
              backgroundImage: `url(${patternImage})`,
            }}
          >
            <Link className="display-6 text-white" to="/wiki/json" style={{ textDecoration: 'none' }}>
              JSON
            </Link>
            <p className="text-white">Visualize data from any JSON APIs or URLs.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-6 mb-4" onClick={() => navigate('/wiki/csv')}>
          <div
            className="card p-3 text-center feature-card"
            style={{
              backgroundPosition: 'cover',
              backgroundPositionY: '90%',
              backgroundPositionX: '30%',
              backgroundImage: `url(${patternImage})`,
            }}
          >
            <Link className="display-6 text-white" to="/wiki/json" style={{ textDecoration: 'none' }}>
              CSV
            </Link>
            <p className="text-white">Visualize data from any CSV APIs or URLs.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/graphql')}>
          <div
            className="card p-3 text-center feature-card"
            style={{
              backgroundPosition: 'cover',
              backgroundPositionY: '10%',
              backgroundPositionX: '10%',
              backgroundImage: `url(${patternImage})`,
            }}
          >
            <Link className="display-6 text-white" to="/wiki/json" style={{ textDecoration: 'none' }}>
              GraphQL
            </Link>
            <p className="text-white">Visualize data from any GraphQL APIs or URLs.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/html')}>
          <div
            className="card p-3 text-center feature-card"
            style={{
              backgroundPosition: 'cover',
              backgroundPositionY: '5%',
              backgroundPositionX: '10%',
              backgroundImage: `url(${patternImage})`,
            }}
          >
            <Link className="display-6 text-white" to="/wiki/json" style={{ textDecoration: 'none' }}>
              HTML
            </Link>
            <p className="text-white">Visualize data from any HTML pages or URLs.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/xml')}>
          <div
            className="card p-3 text-center feature-card"
            style={{
              backgroundPosition: 'cover',
              backgroundPositionY: '80%',
              backgroundPositionX: '20%',
              backgroundImage: `url(${patternImage})`,
            }}
          >
            <Link className="display-6 text-white" to="/wiki/json" style={{ textDecoration: 'none' }}>
              XML
            </Link>
            <p className="text-white">Visualize data from any XML APIs or URLs.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/series')}>
          <div
            className="card p-3 text-center feature-card"
            style={{
              backgroundPosition: 'cover',
              backgroundPositionY: '30%',
              backgroundPositionX: '10%',
              backgroundImage: `url(${patternImage})`,
            }}
          >
            <Link className="display-6 text-white" to="/wiki/json" style={{ textDecoration: 'none' }}>
              Math Series
            </Link>
            <p className="text-white">Generate series from mathematical definitions.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-8 mb-4" onClick={() => navigate('/wiki/template-variables')}>
          <div
            className="card p-3 text-center feature-card"
            style={{
              backgroundPosition: 'cover',
              backgroundPositionY: '50%',
              backgroundPositionX: '70%',
              backgroundImage: `url(${patternImage})`,
            }}
          >
            <Link className="display-6 text-white" to="/wiki/json" style={{ textDecoration: 'none' }}>
              Utility variables
            </Link>
            <p className="text-white">Create custom variables from utility functions</p>
          </div>
        </div>
      </div>
    </div>
  );
};
