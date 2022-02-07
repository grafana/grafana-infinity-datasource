import React from 'react';
import { graphql } from 'gatsby';
import { Link } from 'gatsby';
import { Layout } from '../components/Layout';

export const pageQuery = graphql`
  query {
    allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }, filter: { frontmatter: { slug: { regex: "/blog.*/" } } }) {
      edges {
        node {
          excerpt
          html
          frontmatter {
            title
            slug
            date
          }
        }
      }
    }
  }
`;
export default function Template({
  data,
}: {
  data: {
    allMarkdownRemark: {
      edges: {
        node: {
          excerpt: string;
          html: string;
          frontmatter: {
            title: string;
            slug: string;
            date: string;
          };
        };
      }[];
    };
  };
}) {
  return (
    <Layout showSubMenu={true} title="Blog">
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-bolder my-8">Recent blog posts</h2>
        <div>
          {data.allMarkdownRemark.edges.map((p, index) => {
            return (
              <div key={index} className="my-4 border p-4">
                <Link to={p.node.frontmatter.slug}>
                  <h3 className="text-xl font-bolder">{p.node.frontmatter.title}</h3>
                  <span>{p.node.frontmatter.date}</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
