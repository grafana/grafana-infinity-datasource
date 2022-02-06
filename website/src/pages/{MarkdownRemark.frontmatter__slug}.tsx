import React from 'react';
import { graphql, Link } from 'gatsby';
import { Helmet } from 'react-helmet';
import { Layout } from '../components/Layout';

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

export default function Template({ data }: { data: any }) {
  const { markdownRemark } = data;
  const { frontmatter, html } = markdownRemark;
  return (
    <Layout showSubMenu={true} title={frontmatter.title}>
      <Helmet>
        <title>
          {frontmatter.title} - {data.site.siteMetadata.title}
        </title>
      </Helmet>
      <div className="container mx-auto px-12">
        <div className="blog-post">
          <div className="py-8">
            {frontmatter.slug && frontmatter.slug.startsWith('/blog/') && (
              <div style={{ marginBottom: '20px' }}>
                <a href="/" className="link">
                  <i className="fa fa-home"></i>
                </a>
                <i className="fa fa-arrow-right px-2"></i>
                <Link to="/blog" className="link" style={{ textDecoration: 'none', fontWeight: 'bolder' }}>
                  Blog
                </Link>
                <i className="fa fa-arrow-right px-2"></i>
                {frontmatter.title}
              </div>
            )}
            <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
      {(frontmatter.previous_page_title || frontmatter.next_page_title) && (
        <div>
          <div className="container mx-auto">
            <div className="flex">
              {frontmatter.previous_page_title && (
                <div className="flex-none w-1/2 text-right p-4">
                  <b className="font-light">Previous page</b>
                  <br />
                  <Link className="font-bold text-3xl" to={frontmatter.previous_page_slug}>
                    <i className="fas fa-arrow-left mx-4"></i>
                    {frontmatter.previous_page_title}
                  </Link>
                </div>
              )}
              {frontmatter.next_page_title && (
                <div className="flex-none w-1/2 text-left p-4">
                  <b className="font-light">Next page</b>
                  <br />
                  <Link className="font-bold text-3xl" to={frontmatter.next_page_slug}>
                    {frontmatter.next_page_title}
                    <i className="fas fa-arrow-right mx-4"></i>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
