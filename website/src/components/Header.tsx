import React from 'react';
import { Link } from 'gatsby';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from './ui/navigation-menu';
import { Icons } from './Icons';
import { buttonVariants } from './ui/button';
import { cn } from './../lib/utils';
import { SearchBox } from './SearchBox';

interface ListLinkProps {
  to: string;
  children?: React.ReactNode;
  className?: string;
  description?: string;
}

const ListLink = (props: ListLinkProps) => (
  <li>
    <Link
      to={props.to}
      className={cn('block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors dark:bg-[rgba(0,0,0,0.1)] dark:hover:bg-[rgba(0,0,0,0.2)]', props.className)}
    >
      <>
        <div className="text-sm font-medium leading-none">{props.children}</div>
        {props.description && <p className="text-sm leading-snug text-slate-500 line-clamp-2">{props.description}</p>}
      </>
    </Link>
  </li>
);
interface HeaderProps {
  title: string;
}

// linear-gradient(90deg,#ffc551 0%,#ff804c 155.52%)
export const Header = (props: HeaderProps) => {
  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-b-slate-200 dark:border-b-gray10  dark:bg-gray10 dark:text-slate-50">
        <div className="container mx-auto flex h-16 items-center dark:text-white">
          <div className="hidden md:flex">
            <Link className="mr-6 flex font-bold text-l items-center space-x-2" to="/">
              <img src="https://raw.githubusercontent.com/yesoreyeram/grafana-infinity-datasource/main/src/img/icon.svg" width={'30px'} height={'30px'} className="mr-2" />
              {props.title}
            </Link>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9">Getting Started</NavigationMenuTrigger>
                  <NavigationMenuContent style={{ background: `linear-gradient(90deg,#ffc551 0%,#ff804c 155.52%)` }}>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr_1fr_1fr] dark:text-gray-900">
                      <ListLink to="/wiki/installation">Installation</ListLink>
                      <ListLink to="/wiki/configuration">Configuration</ListLink>
                      <ListLink to="/wiki/provisioning">Provisioning</ListLink>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem className="group">
                  <NavigationMenuTrigger>Formats</NavigationMenuTrigger>
                  <NavigationMenuContent style={{ background: `linear-gradient(90deg,#ffc551 0%,#ff804c 155.52%)` }}>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr_1fr_1fr] dark:text-gray-900">
                      <ListLink to="/wiki/json">JSON</ListLink>
                      <ListLink to="/wiki/csv">CSV</ListLink>
                      <ListLink to="/wiki/xml">XML</ListLink>
                      <ListLink to="/wiki/html">HTML</ListLink>
                      <ListLink to="/wiki/graphql">GraphQL</ListLink>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9">Parsers</NavigationMenuTrigger>
                  <NavigationMenuContent style={{ background: `linear-gradient(90deg,#ffc551 0%,#ff804c 155.52%)` }}>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[1fr] dark:text-gray-900">
                      <ListLink to="/wiki/backend">Backend</ListLink>
                      <ListLink to="/wiki/uql">UQL</ListLink>
                      <ListLink to="/wiki/groq">GROQ</ListLink>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9">Features</NavigationMenuTrigger>
                  <NavigationMenuContent style={{ background: `linear-gradient(90deg,#ffc551 0%,#ff804c 155.52%)` }}>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[700px] lg:grid-cols-[1fr_1fr_1fr_1fr] dark:text-gray-900">
                      <ListLink to="/wiki/authentication">Authentication</ListLink>
                      <ListLink to="/wiki/url">URL</ListLink>
                      <ListLink to="/wiki/template-variables">Variables</ListLink>
                      <ListLink to="/wiki/macros">Macros</ListLink>
                      <ListLink to="/wiki/annotations">Annotations</ListLink>
                      <ListLink to="/wiki/node-graph">Node Graph</ListLink>
                      <ListLink to="/wiki/time-formats">Time Formats</ListLink>
                      <ListLink to="/wiki/reference-data">Reference Data</ListLink>
                      <ListLink to="/wiki/global-queries">Global Queries</ListLink>
                      <ListLink to="/wiki/limitations">Limitations</ListLink>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end">
            <nav className="flex items-center space-x-1">
              <SearchBox />
              <a href="https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose" target="_blank" rel="noreferrer">
                <div className={buttonVariants({ size: 'sm', variant: 'ghost', className: 'text-slate-700 dark:text-slate-400' })}>
                  <Icons.bug className="h-5 w-5" />
                  <span className="px-2 md:hidden">Report Bug</span>
                </div>
              </a>
              <a href="https://github.com/yesoreyeram/grafana-infinity-datasource" target="_blank" rel="noreferrer">
                <div className={buttonVariants({ size: 'sm', variant: 'ghost', className: 'text-slate-700 dark:text-slate-400' })}>
                  <Icons.gitHub className="h-5 w-5" />
                  <span className="px-2 md:hidden">Github</span>
                </div>
              </a>
              <a href="https://www.youtube.com/playlist?list=PL4vVKeEREln5ub1qrSMrwAabU0FiSNtmC" target="_blank" rel="noreferrer">
                <div className={buttonVariants({ size: 'sm', variant: 'ghost', className: 'text-slate-700 dark:text-slate-400' })}>
                  <Icons.youtube className="h-5 w-5" />
                  <span className="px-2 md:hidden">Youtube</span>
                </div>
              </a>
              <a href="https://twitter.com/grafanaInfinity" target="_blank" rel="noreferrer">
                <div className={buttonVariants({ size: 'sm', variant: 'ghost', className: 'text-slate-700 dark:text-slate-400' })}>
                  <Icons.twitter className="h-5 w-5" />
                  <span className="px-2 md:hidden">Twitter</span>
                </div>
              </a>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};
