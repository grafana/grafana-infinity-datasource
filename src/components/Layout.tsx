import React, { ReactChild } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import { SubHeader } from './SubHeader';
import { Header } from './../components/Header';

interface LayoutProps {
  children: ReactChild;
  showSubHeader: boolean;
}

export const Layout = ({ children, showSubHeader }: LayoutProps) => {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  );
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <meta property="og:title" content="Grafana Infinity Datasource Plugin" />
        <meta
          property="og:description"
          content="Do infinite things with Grafana. Turn any website into beautiful grafana dashboards. Supports HTML, CSV, JSON, XML & GraphQL documents."
        />
        <meta
          property="og:image"
          content="https://user-images.githubusercontent.com/153843/92741922-03491380-f377-11ea-9c31-9a744afd3388.png"
        />
        <meta property="og:url" content="https://yesoreyeram.github.io/grafana-infinity-datasource" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@yesoreyeram.github.io/grafana-infinity-datasource" />
        <meta property="twitter:title" content="Grafana Infinity Datasource Plugin." />
        <meta
          property="twitter:description"
          content="Do infinite things with Grafana. Turn any website into beautiful grafana dashboards. Supports HTML, CSV, JSON, XML & GraphQL documents."
        />
        <meta
          property="twitter:image"
          content="https://user-images.githubusercontent.com/153843/92741922-03491380-f377-11ea-9c31-9a744afd3388.png"
        />
        <meta property="" content="" />
        <meta property="" content="" />
        <title>Infinity Datasource</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <Header title={data.site.siteMetadata.title} />
      {showSubHeader && <SubHeader></SubHeader>}
      {children}
    </>
  );
};
