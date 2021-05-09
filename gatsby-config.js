module.exports = {
  pathPrefix: `/grafana-infinity-datasource`,
  siteMetadata: {
    title: `Grafana Infinity Datasource`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    'gatsby-transformer-remark',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/wiki`,
      },
    },
  ],
}
