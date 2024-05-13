FROM node:22-alpine3.18 as base

RUN apk add shadow python3 make gcc g++ git zip

ARG UID=1000
ARG GID=1000
ENV UID=${UID}
ENV GID=${GID}
RUN groupmod -g ${GID} node && usermod -u ${UID} -g ${GID} node

FROM base as build

USER node

WORKDIR /home/node

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install

FROM base as frontend

USER node

COPY --chown=node --from=build /home/node/node_modules/ /node_modules

ENV PATH /node_modules/.bin:$PATH
