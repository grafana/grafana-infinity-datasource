import React from 'react';
import { Link } from 'gatsby';

const FooterSectionHeading = (props: { children?: React.ReactNode }) => {
  return <h4 className="font-bold text-l my-4 text-teal-300">{props.children}</h4>;
};

const FooterMenuitem = (props: { to: string; internal: boolean; children?: React.ReactNode }) => {
  return (
    <li className="my-2">
      {props.internal ? (
        <Link to={props.to}>{props.children}</Link>
      ) : (
        <a href={props.to} target="_blank" rel="noreferrer">
          {props.children}
        </a>
      )}
    </li>
  );
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 py-4">
      <div className="container mx-auto">
        <div className="flex py-4">
          <div className="flex-none w-1/5">
            <FooterSectionHeading>Setup</FooterSectionHeading>
            <ul className="list-unstyled">
              <FooterMenuitem to="/wiki/installation" internal={true}>
                Installation
              </FooterMenuitem>
              <FooterMenuitem to="/wiki/configuration" internal={true}>
                Configuration
              </FooterMenuitem>
              <FooterMenuitem to="/wiki/provisioning" internal={true}>
                Provisioning
              </FooterMenuitem>
              <FooterMenuitem to="/changelog" internal={true}>
                Change Log
              </FooterMenuitem>
              <FooterMenuitem to="/license" internal={true}>
                License
              </FooterMenuitem>
            </ul>
          </div>
          <div className="flex-none w-1/5">
            <FooterSectionHeading>
              <Link to="/welcome">Features</Link>
            </FooterSectionHeading>
            <ul>
              <FooterMenuitem to="/wiki/csv" internal={true}>
                CSV
              </FooterMenuitem>
              <FooterMenuitem to="/wiki/json" internal={true}>
                JSON
              </FooterMenuitem>
              <FooterMenuitem to="/wiki/graphql" internal={true}>
                GraphQL
              </FooterMenuitem>
              <FooterMenuitem to="/wiki/xml" internal={true}>
                XML
              </FooterMenuitem>
              <FooterMenuitem to="/wiki/html" internal={true}>
                HTML
              </FooterMenuitem>
              <FooterMenuitem to="/wiki/template-variables" internal={true}>
                Variables
              </FooterMenuitem>
            </ul>
          </div>
          <div className="flex-none w-1/5">
            <FooterSectionHeading>
              <Link to="/community">Community</Link>
            </FooterSectionHeading>
            <ul>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-infinity-datasource" internal={false}>
                Contributing
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/categories/q-a" internal={false}>
                FAQ
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions" internal={false}>
                Discussions
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose" internal={false}>
                Report Bug
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose" internal={false}>
                Request Feature
              </FooterMenuitem>
            </ul>
          </div>
          <div className="flex-none w-1/5">
            <FooterSectionHeading>Examples</FooterSectionHeading>
            <ul>
              <FooterMenuitem to="/blog" internal={true}>
                Blog
              </FooterMenuitem>
              <FooterMenuitem to="/blog/github" internal={true}>
                Github
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/38" internal={false}>
                ThingSpeak
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/categories/show-and-tell" internal={false}>
                More
              </FooterMenuitem>
            </ul>
          </div>
          <div className="flex-none w-1/5">
            <FooterSectionHeading>More from Author</FooterSectionHeading>
            <ul>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-infinity-panel" internal={false}>
                Infinity Panel
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/yesoreyeram-boomtable-panel" internal={false}>
                Boom Table Panel
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/yesoreyeram-boomtheme-panel" internal={false}>
                Boom Theme Panel
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/yesoreyeram-boomsummary-panel" internal={false}>
                Boom Summary Panel
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-utils" internal={false}>
                Grafana Utils
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-vscode" internal={false}>
                Grafana VS Code Plugin
              </FooterMenuitem>
              <FooterMenuitem to="https://github.com/yesoreyeram/grafana-azure-dashboards" internal={false}>
                Grafana Azure Dashboards
              </FooterMenuitem>
            </ul>
          </div>
        </div>
        <div className="text-center text-slate-100 p-4">
          <span>Copyright © 2020-{currentYear} - Sriramajeyam Sugumaran</span>
        </div>
      </div>
    </footer>
  );
};
