module.exports = {
    title: `Grafana Infinity Datasource`,
    description: `Grafana Infinity Datasource plugin.`,
    base: '/grafana-infinity-datasource/',
    dest: 'docs',
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
            }
        ],
        sidebar: [
            '/',
            ['/CHANGELOG', 'Change Log']
        ]
    }
}