# syntax=docker/dockerfile:1

FROM golang:1.17 AS backend
WORKDIR /mage
RUN git clone https://github.com/magefile/mage
WORKDIR /mage/mage
RUN go run bootstrap.go
WORKDIR /app/grafana-infinity-datasource/backend
COPY pkg/ ./pkg
COPY Magefile.go ./
COPY go.mod ./
COPY go.sum ./
COPY ./src/plugin.json ./src/
RUN go mod download
RUN mage -v

FROM node:16 as frontend
WORKDIR /app/grafana-infinity-datasource/frontend
COPY README.md ./
COPY CHANGELOG.md ./
COPY LICENSE ./
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY jest.config.js ./
COPY .prettierrc.js ./
COPY cspell.config.json ./
COPY src/ ./src/
RUN yarn install --frozen-lockfile
RUN yarn dev

FROM grafana/grafana-enterprise:main
WORKDIR /var/lib/grafana/plugins/yesoreyeram-infinity-datasource
COPY --from=backend /app/grafana-infinity-datasource/backend/dist ./dist/
COPY --from=frontend /app/grafana-infinity-datasource/frontend/dist ./dist/
ENV GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS yesoreyeram-infinity-datasource
ADD ./try/dashboards /dashboards/
ADD ./try/provisioning/datasources/default.yml /etc/grafana/provisioning/datasources/default.yml
ADD ./try/provisioning/dashboards/default.yml /etc/grafana/provisioning/dashboards/default.yml
ENTRYPOINT [ "/run.sh" ]
