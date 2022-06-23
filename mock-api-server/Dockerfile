FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./

RUN yarn install

COPY src ./src
COPY next.config.js .
COPY tsconfig.json .

CMD yarn dev