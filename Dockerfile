# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
# docker run --publish 8000:8000 --env NODE_ENV=production --rm --init "$(docker build --quiet .)"

FROM node:19-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:19-alpine
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY package*.json ./
# https://typicode.github.io/husky/#/?id=with-npm
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /usr/src/app/build ./build

EXPOSE 8000
CMD [ "node", "--enable-source-maps", "." ]
