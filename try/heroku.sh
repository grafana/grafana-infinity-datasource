sed -i -e 's|<HTTP_PORT>|'$PORT'|' /etc/grafana/grafana.ini
sed -i -e 's|<DATABASE_URL>|'$DATABASE_URL'|' /etc/grafana/grafana.ini
sed -i -e 's|<GITHUB_CLIENT_SECRET>|'$GITHUB_CLIENT_SECRET'|' /etc/grafana/grafana.ini
/run.sh