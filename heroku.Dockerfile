FROM grafana/grafana-enterprise:main
ENV GF_INSTALL_PLUGINS https://github.com/yesoreyeram/grafana-infinity-datasource/releases/download/v1.0.0-dev.2/yesoreyeram-infinity-datasource-1.0.0-dev.2.zip;yesoreyeram-infinity-datasource,grafana-worldmap-panel,grafana-clock-panel,yesoreyeram-boomtheme-panel,yesoreyeram-boomtable-panel,https://github.com/yesoreyeram/yesoreyeram-boomsummary-panel/archive/deecb03210355a7ddd1dfca00474b0bcc28b9b4a.zip;yesoreyeram-boomsummary-panel,https://github.com/yesoreyeram/grafana-boomcomments-panel/archive/2bcba5987e930f18c64e4b648ce49a01639ded8f.zip;yesoreyeram-boomcomments-panel,https://github.com/yesoreyeram/grafana-infinity-panel/archive/90648a35cb87948b27bc6a28f5308b21f1b0880c.zip;yesoreyeram-infinity-panel,https://github.com/yesoreyeram/grafana-slideshow-panel/releases/download/v0.0.1/yesoreyeram-slideshow-panel-0.0.1.zip;yesoreyeram-slideshow-panel,grafana-guidedtour-panel,https://github.com/yesoreyeram/grafana-custom-panel/releases/download/v0.1.0/yesoreyeram-custom-panel-0.1.0.zip;yesoreyeram-custom-panel
ADD ./try/heroku.sh /
ADD ./try/grafana.ini /etc/grafana/grafana.ini
ADD ./try/dashboards /dashboards/
ADD ./try/provisioning/datasources/default.yml /etc/grafana/provisioning/datasources/default.yml
ADD ./try/provisioning/dashboards/default.yml /etc/grafana/provisioning/dashboards/default.yml
ENTRYPOINT [ "/heroku.sh" ]
