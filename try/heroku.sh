sed -i -e 's|<HTTP_PORT>|'$PORT'|' /etc/grafana/grafana.ini
sed -i -e 's|<DATABASE_URL>|'$DATABASE_URL'|' /etc/grafana/grafana.ini
sed -i -e 's|<GTM_TAG_MANAGER_ID>|'$GTM_TAG_MANAGER_ID'|' /etc/grafana/grafana.ini
/run.sh