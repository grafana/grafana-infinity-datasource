import React from 'react';
import { Link } from 'gatsby';
import { SearchBox } from '../common/SearchBox';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

export const Header = (props: { title: string }) => {
  const onMenuToggle = () => {
    document.getElementById('main-menu').classList.toggle('block');
    document.getElementById('main-menu').classList.toggle('hidden');
  };
  return (
    <nav className="flex items-center justify-between flex-wrap p-3">
      <div className="flex items-center flex-shrink-0 mr-6">
        <Link to="/">
          <span className="font-bolder text-xl tracking-tight">{props.title}</span>
        </Link>
      </div>
      <div className="block lg:hidden" onClick={onMenuToggle}>
        <button className="flex items-center px-3 py-2 border rounded">
          <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div id="main-menu" className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          <ListLink to="/wiki/uql">UQL</ListLink>
          <ListLink to="/wiki/json">JSON</ListLink>
          <ListLink to="/wiki/csv">CSV</ListLink>
          <ListLink to="/wiki/graphql">GraphQL</ListLink>
          <ListLink to="/wiki/xml">XML</ListLink>
          <ListLink to="/wiki/html">HTML</ListLink>
          <ListLink to="/wiki/template-variables">Variables</ListLink>
          <ListLink to="/wiki/annotations">Annotations</ListLink>
        </div>
        <div>
          <ListLink right={true}>
            <SearchBox />
          </ListLink>
          <ListLink right={true}>
            <ThemeSwitcher />
          </ListLink>
          <ListLink right={true}>
            <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose" target="_blank" rel="noreferrer">
              <i className="fas fa-bug" title="Report Bug"></i>
              <span className="lg:hidden ml-2">Report Bug</span>
            </a>
          </ListLink>
          <ListLink right={true}>
            <a href="https://github.com/yesoreyeram/grafana-infinity-datasource" target="_blank" rel="noreferrer">
              <i className="fab fa-github" title="Github repo"></i>
              <span className="lg:hidden ml-2">Github</span>
            </a>
          </ListLink>
          <ListLink right={true}>
            <a href="https://www.youtube.com/playlist?list=PL4vVKeEREln5ub1qrSMrwAabU0FiSNtmC" target="_blank" rel="noreferrer">
              <i className="fab fa-youtube" title="Youtube videos"></i>
              <span className="lg:hidden ml-2">Youtube</span>
            </a>
          </ListLink>
          <ListLink right={true}>
            <a href="https://twitter.com/grafanaInfinity" target="_blank" rel="noreferrer">
              <i className="fab fa-twitter" title="Updates in twitter"></i>
              <span className="lg:hidden ml-2">Follow</span>
            </a>
          </ListLink>
          <ListLink right={true} special={true}>
            <Link to="/blog">Blog</Link>
          </ListLink>
          <ListLink right={true} special={true}>
            <a href="https://grafana-infinity-datasource.herokuapp.com/d/try/try?orgId=1&editPanel=2" target="_blank" rel="noreferrer">
              Try online
            </a>
          </ListLink>
          <ListLink right={true} special={true}>
            <Link to="/wiki/installation">Install</Link>
          </ListLink>
        </div>
      </div>
    </nav>
  );
};

const ListLink = (props: { to?: string; children?: React.ReactNode; right?: boolean; special?: boolean }) => (
  <>
    {props.right ? (
      props.special ? (
        <span className={`block lg:inline-block text-sm px-2 py-2 ml-2 leading-none rounded mt-4 lg:mt-0`}>{props.children}</span>
      ) : (
        <span className={`block lg:inline-block text-sm px-2 py-2 ml-2 leading-none rounded mt-4 lg:mt-0`}>{props.children}</span>
      )
    ) : (
      <Link className="block lg:inline-block text-sm px-2 py-2 ml-2 leading-none rounded mt-4 lg:mt-0" aria-current="page" to={props.to}>
        {props.children}
      </Link>
    )}
  </>
);
