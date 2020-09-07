module.exports = {
    title: `Grafana Infinity Datasource`,
    description: `Grafana Infinity Datasource plugin.`,
    base: '/grafana-infinity-datasource/',
    dest: 'docs',
    head: [
        ['meta', { property: 'og:title', content: 'Grafana Infinity Datasource' }],
        ['meta', { property: 'og:description', content: 'Turn any website into grafana datasource' }],
        ['meta', { property: 'og:image', content: 'https://user-images.githubusercontent.com/153843/92382187-1a33ff80-f104-11ea-92ec-e5c4fa83fd3f.png' }],
        ['meta', { property: 'og:url', content: 'https://yesoreyeram.github.io/grafana-infinity-datasource' }],
        ['meta', { property: 'twitter:card', content: 'summary'}],
        ['meta', { property: 'twitter:site', content: '@yesoreyeram.github.io/grafana-infinity-datasource'}],
        ['meta', { property: 'twitter:title', content: 'Grafana Infinity Datasource'}],
        ['meta', { property: 'twitter:description', content: 'Turn any website into grafana datasource. Supports HTML, CSV, JSON documents.'}],
        ['meta', { property: 'twitter:image', content: 'https://user-images.githubusercontent.com/153843/92382187-1a33ff80-f104-11ea-92ec-e5c4fa83fd3f.png'}]
    ],
    themeConfig: {
        displayAllHeaders: true,
        nav: [
            {
                text: "Change Log",
                link: "CHANGELOG"
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
            ['/', 'Infinity Datasource'],
            ['/CHANGELOG', 'Change Log']
        ]
    }
}