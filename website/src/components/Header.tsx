import React from 'react';
import { Link } from 'gatsby';
import { SearchBox } from './SearchBox';
import { ThemeSwitcher } from './ThemeSwitcher';

interface ListLinkProps {
  to?: string;
  children?: React.ReactNode;
  right?: boolean;
  special?: boolean;
}

const ListLink = (props: ListLinkProps) => (
  <>
    {props.right ? (
      props.special ? (
        <span className={`block lg:inline-block text-sm px-2 py-2 ml-2 leading-none rounded text-teal-500 border-white hover:border-transparent hover:text-black hover:bg-white mt-4 lg:mt-0`}>
          {props.children}
        </span>
      ) : (
        <span className={`block lg:inline-block text-sm px-2 py-2 ml-2 leading-none rounded text-white border-white hover:border-transparent hover:text-teal-500 hover:bg-white mt-4 lg:mt-0`}>
          {props.children}
        </span>
      )
    ) : (
      <Link className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-teal-500 mr-4" aria-current="page" to={props.to}>
        {props.children}
      </Link>
    )}
  </>
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
      <nav className="flex items-center justify-between flex-wrap bg-black p-3">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <Link to="/">
            <span className="font-semibold text-xl tracking-tight">{props.title}</span>
          </Link>
        </div>
        <div className="block lg:hidden">
          <button className="flex items-center px-3 py-2 border rounded text-white border-text-teal-500 hover:text-white hover:border-white">
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
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
    </>
  );
};
