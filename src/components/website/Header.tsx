import React from 'react';
import { Link } from 'gatsby';

interface ListLinkProps {
  to: string;
  children?: React.ReactNode;
}

const ListLink = (props: ListLinkProps) => (
  <li className={`nav-item`}>
    <Link className="nav-link" aria-current="page" to={props.to}>
      {props.children}
    </Link>
  </li>
);

interface HeaderProps {
  title: string;
}

export const Header = (props: HeaderProps) => {
  const onToggle = () => {
    const doc = document.querySelector('.offcanvas-collapse');
    doc?.classList.toggle('open');
  };
  return (
    <>
      <nav
        id="topnav"
        className="navbar navbar-expand-lg fixed-top navbar-dark"
        style={{ backgroundColor: '#141619' }}
        aria-label="Main navigation"
      >
        <div className="container-fluid">
          <Link className="text-white fw-bold px-2" to="/" style={{ textDecoration: 'none' }}>
            {props.title}
          </Link>
          <button
            className="navbar-toggler p-0 border-0"
            type="button"
            onClick={onToggle}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="navbar-collapse offcanvas-collapse">
            <ul className="navbar-nav d-flex mb-2 mb-lg-0 me-auto">
              <ListLink to="/wiki/json">JSON</ListLink>
              <ListLink to="/wiki/csv">CSV</ListLink>
              <ListLink to="/wiki/graphql">GraphQL</ListLink>
              <ListLink to="/wiki/xml">XML</ListLink>
              <ListLink to="/wiki/html">HTML</ListLink>
              <ListLink to="/wiki/template-variables">Variables</ListLink>
              <ListLink to="/wiki/annotations">Annotations</ListLink>
            </ul>
            <ul className="navbar-nav d-flex mb-2 mb-lg-0">
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fas fa-bug text-secondary"></i>
                  <span className="px-2 small-screen-only">Report Bug</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="https://github.com/yesoreyeram/grafana-infinity-datasource"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-github text-secondary"></i>
                  <span className="px-2 small-screen-only">Github</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  href="https://www.youtube.com/playlist?list=PL4vVKeEREln5ub1qrSMrwAabU0FiSNtmC"
                  className="nav-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-youtube text-secondary"></i>
                  <span className="px-2 small-screen-only">Youtube</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="https://twitter.com/grafanaInfinity" target="_blank" rel="noreferrer">
                  <i className="fab fa-twitter text-secondary"></i>
                  <span className="px-2 small-screen-only">Follow</span>
                </a>
              </li>
            </ul>
            <ul className="navbar-nav d-flex mb-2 mb-lg-0">
              <a
                className="nav-links special-menu highlight rounded text-white fw-bolder"
                href="https://grafana.sriramajeyam.com"
                target="_blank"
                rel="noreferrer"
              >
                Try online
              </a>
              <Link className="nav-links rounded text-white fw-bolder special-menu" to="/wiki/installation">
                Install
              </Link>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
