module.exports = {
  pathPrefix: process.env.GATSBY_PREFIX_PATHS === 'IGNORE' ? false : `/grafana-infinity-datasource`,
  siteMetadata: {
    title: `Grafana Infinity Datasource`,
    description: `Do infinite things with Grafana. Turn any website into beautiful grafana dashboards. Supports HTML, CSV, JSON, XML & GraphQL documents.`,
    socialImage: `https://user-images.githubusercontent.com/153843/92741922-03491380-f377-11ea-9c31-9a744afd3388.png`,
    website: `https://yesoreyeram.github.io/grafana-infinity-datasource`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    'gatsby-transformer-remark',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/src/wiki`,
      },
    },
  ],
};
