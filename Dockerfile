# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
# docker run --publish 8000:8000 --rm --init "$(docker build --quiet .)"

FROM node:19-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:19-alpine
ENV NODE_ENV production
USER node
WORKDIR /usr/src/app
COPY package*.json ./
# https://typicode.github.io/husky/#/?id=with-npm
RUN npm install --omit=dev --ignore-scripts
COPY --from=builder /usr/src/app/build ./build

EXPOSE 8000
CMD [ "npm", "start" ]
