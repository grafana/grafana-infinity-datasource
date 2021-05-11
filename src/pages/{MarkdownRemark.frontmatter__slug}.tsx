import React from 'react';
import { graphql } from 'gatsby';
import { Layout } from '../components/Layout';

export interface TemplateProps {
  data: any;
}

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        slug
        title
      }
    }
  }
`;

export default function Template({ data }: TemplateProps) {
  const { markdownRemark } = data;
  const { frontmatter, html } = markdownRemark;
  return (
    <Layout showSubMenu={true} title={frontmatter.title}>
      <div className="blog-post-container">
        <div className="blog-post">
          <div className="container py-4">
            <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
