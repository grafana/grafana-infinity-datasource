import React from 'react';
import { Link } from 'gatsby';

const FooterMenuitem: React.FC<{
  to: string;
  internal: boolean;
}> = props => {
  return (
    <li className="my-2">
      {props.internal ? (
        <Link to={props.to} style={{ textDecoration: 'none', color: '#6c757d' }}>
          {props.children}
        </Link>
      ) : (
        <a href={props.to} target="_blank" style={{ textDecoration: 'none', color: '#6c757d' }}>
          {props.children}
        </a>
      )}
    </li>
  );
};

export const Footer: React.FC<any> = () => {
  return (
    <>
      <footer id="footer" className="footer mt-auto py-5" style={{ background: '#f2f5f7' }}>
        <div className="container">
          <div className="row">
            <div className="col-12 col-md">
              <h4 className="mb-4 fw-light">Setup</h4>
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
                <FooterMenuitem to="/wiki/installation" internal={true}>
                  Query Editor
                </FooterMenuitem>
              </ul>
            </div>
            <div className="col-12 col-md">
              <h4 className="mb-4 fw-light">Features</h4>
              <ul className="list-unstyled">
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
            <div className="col-12 col-md">
              <h4 className="mb-4 fw-light">Community</h4>
              <ul className="list-unstyled">
                <FooterMenuitem to="https://github.com/yesoreyeram/grafana-infinity-datasource" internal={false}>
                  Contributing
                </FooterMenuitem>
                <FooterMenuitem
                  to="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/categories/q-a"
                  internal={false}
                >
                  FAQ
                </FooterMenuitem>
                <FooterMenuitem
                  to="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions"
                  internal={false}
                >
                  Discussions
                </FooterMenuitem>
                <FooterMenuitem
                  to="https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose"
                  internal={false}
                >
                  Report Bug
                </FooterMenuitem>
                <FooterMenuitem
                  to="https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose"
                  internal={false}
                >
                  Request Feature
                </FooterMenuitem>
              </ul>
            </div>
            <div className="col-12 col-md">
              <h4 className="mb-4 fw-light">Examples</h4>
              <ul className="list-unstyled">
                <FooterMenuitem to="/showcase/github" internal={true}>
                  Github
                </FooterMenuitem>
                <FooterMenuitem
                  to="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/38"
                  internal={false}
                >
                  ThingSpeak
                </FooterMenuitem>
                <FooterMenuitem
                  to="https://github.com/yesoreyeram/grafana-infinity-datasource/discussions/categories/show-and-tell"
                  internal={false}
                >
                  More
                </FooterMenuitem>
              </ul>
            </div>
            <div className="col-12 col-md">
              <h4 className="mb-4 fw-light">More from Author</h4>
              <ul className="list-unstyled">
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
          <div className="row text-center mt-4">
            <span className="muted ">Sriramajeyam Sugumaran</span>
          </div>
        </div>
      </footer>
    </>
  );
};
