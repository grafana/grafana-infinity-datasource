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
        <h2 className="text-xl font-bolder my-8">Recent blog posts</h2>
        <div>
          <ul style={{ margin: '0px', listStyle: 'none', padding: '0px' }}>
            {data.allMarkdownRemark.edges.map((p) => {
              return (
                <li style={{ marginBlock: '10px', listStyle: 'none', paddingBlock: '5px' }}>
                  <Link className="link" to={p.node.frontmatter.slug}>
                    <b>{p.node.frontmatter.title}</b> - <span>{p.node.frontmatter.date}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
