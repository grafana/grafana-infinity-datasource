import React from 'react';
import { Link } from 'gatsby';

const SubHeaderLink: React.FC<{ to: string; className?: string }> = props => {
  return (
    <Link className={`nav-link ${props.className}`} to={props.to}>
      {props.children}
    </Link>
  );
};

export const SubHeader = () => {
  return (
    <>
      <div className="nav-scroller shadow-sm" style={{ backgroundColor: '#021936' }}>
        <nav id="subnav" className="nav nav-underline d-flex" aria-label="Secondary navigation">
          <span className="ml-4"></span>
          <SubHeaderLink to="/">Home</SubHeaderLink>
          <SubHeaderLink to="/features">Features</SubHeaderLink>
          <SubHeaderLink to="/wiki/url">URL</SubHeaderLink>
          <SubHeaderLink to="/wiki/csv">CSV</SubHeaderLink>
          <SubHeaderLink to="/wiki/json">JSON</SubHeaderLink>
          <SubHeaderLink to="/wiki/graphql">GraphQL</SubHeaderLink>
          <SubHeaderLink to="/wiki/xml">XML</SubHeaderLink>
          <SubHeaderLink to="/wiki/html">HTML</SubHeaderLink>
          <span className="me-auto"></span>
          <SubHeaderLink to="/wiki/installation">Install</SubHeaderLink>
          <SubHeaderLink to="/wiki/global-queries">Global Queries</SubHeaderLink>
          <SubHeaderLink to="/wiki/template-variables">Template Variables</SubHeaderLink>
        </nav>
      </div>
    </>
  );
};
