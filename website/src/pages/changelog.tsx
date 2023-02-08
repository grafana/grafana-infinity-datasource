import React from 'react';
import { graphql } from 'gatsby';
import { Layout } from './../components/Layout';

export interface TemplateProps {
  data: any;
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        changelog
      }
    }
  }
`;

export default function Template({ data }: TemplateProps) {
  return (
    <Layout title="CHANGELOG">
      {data.site.siteMetadata.changelog.markdown}
      <div className="blog-post-container">
        <div className="blog-post">
          <div className="container py-4">
            <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: data.site.siteMetadata.changelog }} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
