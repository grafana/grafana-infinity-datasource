import React, { useEffect } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import { defineCustomElements as deckDeckGoHighlightElement } from '@deckdeckgo/highlight-code/dist/loader';
import { SubMenu } from './menu/SubMenu';
import { Header } from './menu/Header';
import { Footer } from './Footer';
import { SubHeader } from './SubHeader';

interface LayoutProps {
  showSubMenu: boolean;
  title: string;
  children?: React.ReactNode;
}

deckDeckGoHighlightElement();

export const Layout = (props: LayoutProps) => {
  const DEFAULT_THEME = 'light';
  useEffect(() => {
    document.getElementsByTagName('html')[0].classList.add(`${DEFAULT_THEME}-theme`);
    document.getElementsByTagName('html')[0].setAttribute('style', `color-scheme : ${DEFAULT_THEME};`);
  }, []);
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            socialImage
            website
          }
        }
      }
    `
  );
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <meta property="og:title" content={data.site.siteMetadata.title} />
        <meta property="og:description" content={data.site.siteMetadata.description} />
        <meta property="og:image" content={data.site.siteMetadata.socialImage} />
        <meta property="og:url" content={data.site.siteMetadata.website} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@yesoreyeram.github.io/grafana-infinity-datasource" />
        <meta property="twitter:title" content={data.site.siteMetadata.title} />
        <meta property="twitter:description" content={data.site.siteMetadata.description} />
        <meta property="twitter:image" content={data.site.siteMetadata.socialImage} />
        <link rel="alternate" type="application/rss+xml" title={`RSS feed for ${data.site.siteMetadata.website}`} href="/rss.xml" />
        <title>{data.site.siteMetadata.title}</title>
      </Helmet>
      <div>
        <Header title={data.site.siteMetadata.title} />
        {props.showSubMenu && <SubMenu></SubMenu>}
        {props.title !== '' && <SubHeader title={props.title} />}
        <main>
          <div>{props.children}</div>
        </main>
        <Footer />
      </div>
    </>
  );
};
