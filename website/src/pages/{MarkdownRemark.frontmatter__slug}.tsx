import React from 'react';
import { graphql } from 'gatsby';
import { Helmet } from 'react-helmet';

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
    <>
      <Helmet>
        <title>
          {frontmatter.title} - {data.site.siteMetadata.title}
        </title>
      </Helmet>
      <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
