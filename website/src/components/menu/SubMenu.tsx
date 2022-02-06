import React from 'react';
import { Link } from 'gatsby';

interface SubMenuLinkProps {
  to: string;
  className?: string;
  children?: React.ReactNode;
}
const SubMenuLink = (props: SubMenuLinkProps) => {
  return (
    <Link className="mr-2 px-2 py-1 rounded font-light text-sm" to={props.to}>
      {props.children}
    </Link>
  );
};

export const SubMenu = () => {
  return (
    <nav aria-label="Secondary navigation" className="pl-3 py-2">
      <SubMenuLink to="/wiki/uql">UQL</SubMenuLink>
      <SubMenuLink to="/wiki/json">JSON</SubMenuLink>
      <SubMenuLink to="/wiki/csv">CSV</SubMenuLink>
      <SubMenuLink to="/wiki/graphql">GraphQL</SubMenuLink>
      <SubMenuLink to="/wiki/xml">XML</SubMenuLink>
      <SubMenuLink to="/wiki/groq">GROQ</SubMenuLink>
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
  );
};
