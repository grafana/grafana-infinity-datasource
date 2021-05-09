import React, { ReactChild } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Helmet } from 'react-helmet';
import { SubHeader } from './SubHeader';
import { Header } from './../components/Header';
import { Footer } from './../components/Footer';

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
        <title>{data.site.siteMetadata.title}</title>
      </Helmet>
      <Header title={data.site.siteMetadata.title} />
      {showSubHeader && <SubHeader></SubHeader>}
      <div>{children}</div>
      <Footer />
    </>
  );
};
