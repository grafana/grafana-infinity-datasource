import React from 'react';
import { Link, navigate } from 'gatsby';

export const Features = () => {
  return (
    <div className="container my-4" id="features-section" style={{ zIndex: 200 }}>
      <div className="row">
        <div className="col-sm-6 col-lg-4 mb-4">
          <div className="card p-3 text-center">
            <Link className="display-6" to="/wiki/uql" style={{ textDecoration: 'none' }}>
              UQL
            </Link>
            <p>Transform results in a powerful way</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4">
          <div className="card p-3 text-center">
            <Link className="display-6" to="/wiki/json" style={{ textDecoration: 'none' }}>
              JSON
            </Link>
            <p>Visualize data from any JSON APIs or URLs</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/csv')}>
          <div className="card p-3 text-center">
            <Link className="display-6" to="/wiki/json" style={{ textDecoration: 'none' }}>
              CSV
            </Link>
            <p>Visualize data from any CSV APIs, or URLs</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/graphql')}>
          <div className="card p-3 text-center">
            <Link className="display-6" to="/wiki/json" style={{ textDecoration: 'none' }}>
              GraphQL
            </Link>
            <p>Visualize data from any GraphQL APIs or URLs.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/html')}>
          <div className="card p-3 text-center">
            <Link className="display-6" to="/wiki/json" style={{ textDecoration: 'none' }}>
              HTML
            </Link>
            <p>Visualize data from any HTML pages or URLs.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/xml')}>
          <div className="card p-3 text-center">
            <Link className="display-6" to="/wiki/json" style={{ textDecoration: 'none' }}>
              XML
            </Link>
            <p>Visualize data from any XML APIs or URLs.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-4 mb-4" onClick={() => navigate('/wiki/series')}>
          <div className="card p-3 text-center">
            <Link className="display-6" to="/wiki/json" style={{ textDecoration: 'none' }}>
              Math Series
            </Link>
            <p>Generate series from mathematical definitions.</p>
          </div>
        </div>
        <div className="col-sm-6 col-lg-8 mb-4" onClick={() => navigate('/wiki/template-variables')}>
          <div className="card p-3 text-center">
            <Link className="display-6" to="/wiki/json" style={{ textDecoration: 'none' }}>
              Utility variables
            </Link>
            <p>Create custom variables from utility functions</p>
          </div>
        </div>
      </div>
    </div>
  );
};
