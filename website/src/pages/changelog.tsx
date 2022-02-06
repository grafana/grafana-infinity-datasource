import React from 'react';
import { graphql } from 'gatsby';
import { Layout } from '../components/Layout';

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        changelog
      }
    }
  }
`;

export default function Template({ data }: { data: any }) {
  return (
    <Layout showSubMenu={true} title="CHANGELOG">
      <div className="container mx-auto py-10">
        <div className="blog-post">
          <div dangerouslySetInnerHTML={{ __html: data.site.siteMetadata.changelog }} />
        </div>
      </div>
    </Layout>
  );
}
