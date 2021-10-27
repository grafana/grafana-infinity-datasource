import React from 'react';
import { Link } from 'gatsby';

interface SubMenuLinkProps {
  to: string;
  className?: string;
  children?: React.ReactNode;
}
const SubMenuLink = (props: SubMenuLinkProps) => {
  return (
    <Link className={`nav-link ${props.className}`} to={props.to}>
      {props.children}
    </Link>
  );
};

export const SubMenu = () => {
  return (
    <>
      <div className="nav-scroller shadow-sm" style={{ backgroundColor: '#021936' }}>
        <nav id="subnav" className="nav nav-underline d-flex" aria-label="Secondary navigation">
          <span className="ml-4"></span>
          <SubMenuLink to="/wiki/json">JSON</SubMenuLink>
          <SubMenuLink to="/wiki/csv">CSV</SubMenuLink>
          <SubMenuLink to="/wiki/graphql">GraphQL</SubMenuLink>
          <SubMenuLink to="/wiki/xml">XML</SubMenuLink>
          <SubMenuLink to="/wiki/html">HTML</SubMenuLink>
          <SubMenuLink to="/wiki/url">URL</SubMenuLink>
          <SubMenuLink to="/wiki/time-formats">Time Formats</SubMenuLink>
          <SubMenuLink to="/wiki/template-variables">Template Variables</SubMenuLink>
          <SubMenuLink to="/wiki/annotations">Annotations</SubMenuLink>
          <SubMenuLink to="/wiki/node-graph">Node Graph</SubMenuLink>
          <SubMenuLink to="/wiki/global-queries">Global Queries</SubMenuLink>
          <SubMenuLink to="/wiki/configuration">Configuration</SubMenuLink>
          <SubMenuLink to="/wiki/provisioning">Provisioning</SubMenuLink>
        </nav>
      </div>
    </>
  );
};
