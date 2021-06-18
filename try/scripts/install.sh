#!/bin/bash

echo "installing docker"
sudo apt-get --yes update
sudo apt install --yes apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
sudo apt update
apt-cache policy docker-ce
sudo apt install --yes docker-ce
docker --version

echo "installing docker-compose"
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

echo "starting grafana"
cd ~/grafana-infinity-datasource
sudo docker-compose -f ./try/docker-compose.yml pull
sudo docker-compose -d -f ./try/docker-compose.yml up

exit 0;