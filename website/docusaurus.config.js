module.exports = {
  title: 'Grafana Infinity Datasource',
  tagline: 'Do infinite things with grafana',
  url: 'https://yesoreyeram.github.io',
  baseUrl: '/grafana-infinity-datasource/',
  onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',
  organizationName: 'yesoreyeram',
  projectName: 'grafana-infinity-datasource',
  themeConfig: {
    navbar: {
      title: 'Grafana Infinity Datasource',
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          to: 'blog',
          label: 'Blog',
          position: 'left'
        },
        {
          href: 'https://github.com/yesoreyeram/grafana-infinity-datasource',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'CSV Datasource',
              to: 'docs/csv/',
            },
            {
              label: 'JSON Datasource',
              to: 'docs/json/',
            },
            {
              label: 'HTML Datasource',
              to: 'docs/html/',
            },
          ],
        },
        {
          title: 'Blog',
          items: [
            {
              label: 'Blog',
              to: 'blog/',
            }
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/yesoreyeram/grafana-infinity-datasource',
            }
          ],
        },
      ]
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/yesoreyeram/grafana-infinity-datasource/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/yesoreyeram/grafana-infinity-datasource/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
