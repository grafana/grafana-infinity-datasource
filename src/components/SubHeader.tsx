import React from 'react';
import { Link } from 'gatsby';

export const SubHeader = () => {
  return (
    <>
      <div className="nav-scroller shadow-sm" style={{ backgroundColor: '#021E40' }}>
        <nav className="nav nav-underline d-flex" aria-label="Secondary navigation">
          <Link className="nav-link ml-4" to="/">
            Home
          </Link>
          <Link className="nav-link" to="/features">
            Features
          </Link>
          <Link className="nav-link" to="/wiki/url">
            URL
          </Link>
          <Link className="nav-link" to="/wiki/csv">
            CSV
          </Link>
          <Link className="nav-link" to="/wiki/json">
            JSON
          </Link>
          <Link className="nav-link" to="/wiki/graphql">
            GraphQL
          </Link>
          <Link className="nav-link" to="/wiki/xml">
            XML
          </Link>
          <Link className="me-auto nav-link" to="/wiki/html">
            HTML
          </Link>
          <Link className="nav-link" to="/wiki/installation">
            Install
          </Link>
          <Link className="nav-link" to="/wiki/global-queries">
            Global Queries
          </Link>
          <Link className="nav-link" to="/wiki/template-variables">
            Template Variables
          </Link>
        </nav>
      </div>
    </>
  );
};
