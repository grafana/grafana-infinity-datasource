import React from 'react';
import { Link } from 'gatsby';

interface ListLinkProps {
  to: string;
}

const ListLink: React.FC<ListLinkProps> = props => (
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
          <Link className="text-white fw-bold px-2" to="/features" style={{ textDecoration: 'none' }}>
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
              <ListLink to="/wiki/csv">CSV</ListLink>
              <ListLink to="/wiki/json">JSON</ListLink>
              <ListLink to="/wiki/graphql">GraphQL</ListLink>
              <ListLink to="/wiki/xml">XML</ListLink>
              <ListLink to="/wiki/html">HTML</ListLink>
              <ListLink to="/wiki/template-variables">Variables</ListLink>
            </ul>
            <ul className="navbar-nav d-flex mb-2 mb-lg-0">
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="https://github.com/yesoreyeram/grafana-infinity-datasource"
                  target="_blank"
                >
                  Github
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose"
                  target="_blank"
                >
                  Report Bug
                </a>
              </li>
              <li className="nav-item">
                <Link className="nav-link rounded fw-bolder" to="/wiki/installation">
                  Install
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
