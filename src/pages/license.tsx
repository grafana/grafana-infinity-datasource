import React from 'react';
import { graphql } from 'gatsby';
import { Layout } from '../components/website/Layout';

export interface TemplateProps {
  data: any;
}

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        license
      }
    }
  }
`;

export default function Template({ data }: TemplateProps) {
  return (
    <Layout showSubMenu={true} title="LICENSE">
      <div className="blog-post-container">
        <div className="blog-post">
          <div className="container py-4 px-4">
            <pre style={{ width: '60%', margin: '0px auto' }}>{data.site.siteMetadata.license}</pre>
          </div>
        </div>
      </div>
    </Layout>
  );
}
