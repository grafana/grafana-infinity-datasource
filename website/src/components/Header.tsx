import React from 'react';
import { Link } from 'gatsby';
import { ThemeSwitcher } from './ThemeSwitcher';

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
      <nav id="topnav" className="navbar navbar-expand-lg fixed-top navbar-dark" aria-label="Main navigation">
        <div className="container-fluid">
          <Link id="brand" className="fw-bold px-2" to="/">
            {props.title}
          </Link>
          <button className="navbar-toggler p-0 border-0" type="button" onClick={onToggle} aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="navbar-collapse offcanvas-collapse">
            <ul className="navbar-nav d-flex mb-2 mb-lg-0 me-auto">
              <ListLink to="/blog">Blog</ListLink>
              <ListLink to="/wiki/uql">UQL</ListLink>
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
                <span className="nav-link">
                  <ThemeSwitcher />
                </span>
              </li>
              <li className="nav-item">
                <button>
                  <a className="nav-link" href="https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose" target="_blank" rel="noreferrer">
                    <i className="fas fa-bug" title="Report Bug"></i>
                    <span className="px-2 small-screen-only">Report Bug</span>
                  </a>
                </button>
              </li>
              <li className="nav-item">
                <button>
                  <a className="nav-link" href="https://github.com/yesoreyeram/grafana-infinity-datasource" target="_blank" rel="noreferrer">
                    <i className="fab fa-github" title="Github repo"></i>
                    <span className="px-2 small-screen-only">Github</span>
                  </a>
                </button>
              </li>
              <li className="nav-item">
                <button>
                  <a href="https://www.youtube.com/playlist?list=PL4vVKeEREln5ub1qrSMrwAabU0FiSNtmC" className="nav-link" target="_blank" rel="noreferrer">
                    <i className="fab fa-youtube" title="Youtube videos"></i>
                    <span className="px-2 small-screen-only">Youtube</span>
                  </a>
                </button>
              </li>
              <li className="nav-item">
                <button>
                  <a className="nav-link" href="https://twitter.com/grafanaInfinity" target="_blank" rel="noreferrer">
                    <i className="fab fa-twitter" title="Updates in twitter"></i>
                    <span className="px-2 small-screen-only">Follow</span>
                  </a>
                </button>
              </li>
            </ul>
            <ul className="navbar-nav d-flex mb-2 mb-lg-0">
              <a className="nav-links rounded special-menu" href="https://grafana-infinity-datasource.herokuapp.com/d/try/try?orgId=1&editPanel=2" target="_blank" rel="noreferrer">
                Try online
              </a>
              <Link className="nav-links rounded special-menu" to="/wiki/installation">
                Install
              </Link>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
