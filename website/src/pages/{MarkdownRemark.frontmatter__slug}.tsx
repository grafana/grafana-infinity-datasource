import React from 'react';
import { graphql, Link } from 'gatsby';
import { Helmet } from 'react-helmet';
import { Layout } from '../components/Layout';

export interface TemplateProps {
  data: any;
}

export const pageQuery = graphql`
  query ($id: String!) {
    site {
      siteMetadata {
        title
        description
        socialImage
        website
      }
    }
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        slug
        title
        previous_page_title
        previous_page_slug
        next_page_title
        next_page_slug
      }
    }
  }
`;

export default function Template({ data }: TemplateProps) {
  const { markdownRemark } = data;
  const { frontmatter, html } = markdownRemark;
  return (
    <Layout showSubMenu={true} title={frontmatter.title}>
      <Helmet>
        <title>
          {frontmatter.title} - {data.site.siteMetadata.title}
        </title>
      </Helmet>
      <div className="blog-post-container">
        <div className="blog-post">
          <div className="container py-4">
            <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
      {(frontmatter.previous_page_title || frontmatter.next_page_title) && (
        <div id="prev-next-nav">
          <div className="container py-2">
            <div className="row">
              {frontmatter.previous_page_title && (
                <div className="col-6 text-end item rounded p-2">
                  <Link to={frontmatter.previous_page_slug}>&lt;&nbsp;&nbsp;{frontmatter.previous_page_title}</Link>
                </div>
              )}
              {frontmatter.next_page_title && (
                <div className="col-6 text-start item rounded p-2">
                  <Link to={frontmatter.next_page_slug}>{frontmatter.next_page_title}&nbsp;&nbsp;&gt;</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
