module.exports = {
  pathPrefix: process.env.GATSBY_PREFIX_PATHS === 'IGNORE' ? false : `/grafana-infinity-datasource`,
  siteMetadata: {
    title: `Grafana Infinity Datasource`,
    description: `Do infinite things with Grafana. Turn any website into beautiful grafana dashboards. Supports HTML, CSV, JSON, XML & GraphQL documents.`,
    socialImage: `https://user-images.githubusercontent.com/153843/92741922-03491380-f377-11ea-9c31-9a744afd3388.png`,
    website: `https://yesoreyeram.github.io/grafana-infinity-datasource`,
    wallpaper: `https://user-images.githubusercontent.com/153843/117763443-b9287280-b222-11eb-9339-b4a0288068b8.png`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sass`,
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-highlight-code`,
            options: {
              terminal: 'carbon',
              theme: 'vscode'
            }
          }
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown-pages`,
        path: `${__dirname}/src/wiki`,
      },
    },
  ],
};
