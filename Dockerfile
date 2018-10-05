FROM node as tsc

WORKDIR /app
COPY package.json .
RUN npm install

COPY . /app

RUN npx tsc

FROM node:8-slim

ENV NPM_CONFIG_PREFIX /home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

WORKDIR /app

COPY package.json .
RUN npm install

RUN apt-get update && apt-get install -qy graphicsmagick

COPY --from=tsc ./app/dist /app/dist

VOLUME /media/photos

EXPOSE 3001
CMD ["node", "."]