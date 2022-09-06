const fs = require('fs');
const showdown = require('showdown');

const showdownConverter = new showdown.Converter();
const CHANGELOG = fs.readFileSync('../CHANGELOG.md');
const LICENSE = fs.readFileSync('../LICENSE');

module.exports = {
  pathPrefix: process.env.GATSBY_PREFIX_PATHS === 'IGNORE' ? false : `/grafana-infinity-datasource`,
  siteMetadata: {
    title: `Grafana Infinity Datasource`,
    description: `Do infinite things with Grafana. Turn any website into beautiful grafana dashboards. Supports HTML, CSV, JSON, XML & GraphQL documents.`,
    socialImage: `https://user-images.githubusercontent.com/153843/92741922-03491380-f377-11ea-9c31-9a744afd3388.png`,
    website: `https://yesoreyeram.github.io/grafana-infinity-datasource`,
    wallpaper: `https://user-images.githubusercontent.com/153843/118251945-1da43580-b4a0-11eb-8a68-c61c5a38098f.png`,
    changelog: showdownConverter.makeHtml(CHANGELOG.toString()),
    license: LICENSE.toString(),
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                website
                site_url: website
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map((edge) => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: new Date(edge.node.frontmatter.date || ''),
                  updated: new Date(edge.node.frontmatter.date || ''),
                  url: site.siteMetadata.website + edge.node.frontmatter.slug,
                  guid: site.siteMetadata.website + edge.node.frontmatter.slug,
                  custom_elements: [{ 'content:encoded': edge.node.html }],
                });
              });
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] }
                  filter: {frontmatter: {slug: {regex: "/blog.*/"}}}
                ) {
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
            `,
            output: '/rss.xml',
            title: "Your Site's RSS Feed",
          },
        ],
      },
    },
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-highlight-code`,
            options: {
              terminal: 'carbon',
              theme: 'vscode',
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/../docs`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/../blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages`,
      },
    },
    `gatsby-plugin-mdx`,
  ],
};
