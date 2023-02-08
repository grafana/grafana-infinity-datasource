import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import { defineCustomElements as deckDeckGoHighlightElement } from '@deckdeckgo/highlight-code/dist/loader';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  title: string;
  children?: React.ReactNode;
}

deckDeckGoHighlightElement();

export const Layout = (props: LayoutProps) => {
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

      <div data-theme="dark">
        <div className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-gray05 dark:text-slate-50">
          <Header title={data.site.siteMetadata.title} />
          {props.title && (
            <section className="text-center p-10  font-bold text-3xl dark:text-black" style={{ background: 'linear-gradient(90deg,#ffc551 0%,#ff804c 155.52%)' }}>
              <h1 className="my-10 text-[2.3rem]">{props.title}</h1>
            </section>
          )}
          <main className="dark:bg-gray05 dark:text-slate-50">{props.children}</main>
        </div>
        <Footer />
      </div>
    </>
  );
};
