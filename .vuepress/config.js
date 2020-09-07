module.exports = {
    title: `Grafana Utils Datasource`,
    description: `Grafana Utils Datasource plugin.`,
    base: '/grafana-utils-datasource/',
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
                link: "https://github.com/yesoreyeram/grafana-utils-datasource/issues/new/choose"
            },
            {
                text: "Github",
                link: "https://github.com/yesoreyeram/grafana-utils-datasource"
            }
        ],
        sidebar: [
            '/',
            ['/CHANGELOG', 'Change Log']
        ]
    }
}