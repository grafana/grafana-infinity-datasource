module.exports = {
    title: `Grafana Infinity Datasource`,
    description: `Do infinite things with Grafana. Turn any website into beautiful grafana dashboards.`,
    base: '/grafana-infinity-datasource/',
    dest: 'docs',
    head: [
        ['meta', { property: 'og:title', content: 'Grafana Infinity Datasource Plugin' }],
        ['meta', { property: 'og:description', content: 'Do infinite things with Grafana. Turn any website into beautiful grafana dashboards. Supports HTML, CSV, JSON documents.' }],
        ['meta', { property: 'og:image', content: 'https://user-images.githubusercontent.com/153843/92382187-1a33ff80-f104-11ea-92ec-e5c4fa83fd3f.png' }],
        ['meta', { property: 'og:url', content: 'https://yesoreyeram.github.io/grafana-infinity-datasource' }],
        ['meta', { property: 'twitter:card', content: 'summary_large_image'}],
        ['meta', { property: 'twitter:site', content: '@yesoreyeram.github.io/grafana-infinity-datasource'}],
        ['meta', { property: 'twitter:title', content: 'Grafana Infinity Datasource Plugin.'}],
        ['meta', { property: 'twitter:description', content: 'Do infinite things with Grafana. Turn any website into beautiful grafana dashboards. Supports HTML, CSV, JSON documents.'}],
        ['meta', { property: 'twitter:image', content: 'https://user-images.githubusercontent.com/153843/92382187-1a33ff80-f104-11ea-92ec-e5c4fa83fd3f.png'}]
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
            ['/wiki/html', 'HTML'],
            ['/wiki/installation', 'Installation'],
            ['/CHANGELOG', 'Change Log']
        ]
    }
}