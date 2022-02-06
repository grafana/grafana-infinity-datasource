import React from 'react';
import { graphql } from 'gatsby';
import { Layout } from '../components/Layout';

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        license
      }
    }
  }
`;

export default function Template({ data }: { data: any }) {
  return (
    <Layout showSubMenu={true} title="LICENSE">
      <div className="container mx-auto py-4">
        <pre style={{ marginLeft: '25%' }}>{data.site.siteMetadata.license}</pre>
      </div>
    </Layout>
  );
}
