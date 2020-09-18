module.exports = {
    title: `Grafana Infinity Datasource`,
    description: `Do infinite things with Grafana. Turn any website into beautiful grafana dashboards.`,
    base: '/grafana-infinity-datasource/',
    dest: 'docs',
    head: [
        ['meta', { property: 'og:title', content: 'Grafana Infinity Datasource Plugin' }],
        ['meta', { property: 'og:description', content: 'Do infinite things with Grafana. Turn any website into beautiful grafana dashboards. Supports HTML, CSV, JSON documents.' }],
        ['meta', { property: 'og:image', content: 'https://user-images.githubusercontent.com/153843/92741922-03491380-f377-11ea-9c31-9a744afd3388.png' }],
        ['meta', { property: 'og:url', content: 'https://yesoreyeram.github.io/grafana-infinity-datasource' }],
        ['meta', { property: 'twitter:card', content: 'summary_large_image'}],
        ['meta', { property: 'twitter:site', content: '@yesoreyeram.github.io/grafana-infinity-datasource'}],
        ['meta', { property: 'twitter:title', content: 'Grafana Infinity Datasource Plugin.'}],
        ['meta', { property: 'twitter:description', content: 'Do infinite things with Grafana. Turn any website into beautiful grafana dashboards. Supports HTML, CSV, JSON documents.'}],
        ['meta', { property: 'twitter:image', content: 'https://user-images.githubusercontent.com/153843/92741922-03491380-f377-11ea-9c31-9a744afd3388.png'}]
    ],
    themeConfig: {
        displayAllHeaders: true,
        nav: [
            {
                text: "Install",
                link: "/wiki/installation"
            },
            {
                text: "Report Bug",
                link: "https://github.com/yesoreyeram/grafana-infinity-datasource/issues/new/choose"
            },
            {
                text: "Github",
                link: "https://github.com/yesoreyeram/grafana-infinity-datasource"
            },
            {
                text: "Author",
                link: "https://sriramajeyam.com"
            }
        ],
        sidebar: [
            ['/wiki/features', 'Guide'],
            ['/wiki/csv', 'CSV'],
            ['/wiki/json', 'JSON'],
            ['/wiki/graphql', 'GraphQL'],
            ['/wiki/html', 'HTML'],
            ['/wiki/installation', 'Installation'],
            ['/CHANGELOG', 'Change Log']
        ]
    }
}