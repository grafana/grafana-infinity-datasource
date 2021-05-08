import React from 'react';
import { graphql } from 'gatsby';
import { Layout } from '../components/Layout';

export interface TemplateProps {
  data: any;
}

export default function Template({ data }: TemplateProps) {
  const { markdownRemark } = data;
  const { frontmatter, html } = markdownRemark;
  return (
    <Layout showSubHeader={true}>
      <div className="blog-post-container">
        <div className="blog-post">
          <section className="subheader py-5 text-center" style={{ backgroundColor: '#021E40', color: 'white' }}>
            <h1>{frontmatter.title}</h1>
          </section>
          <div className="container" style={{ paddingTop: '20px' }}>
            <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </Layout>
  );
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
