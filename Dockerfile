FROM registry.cn-beijing.aliyuncs.com/js-design-dev/node:18-alpine-ci-amd64 as build

RUN mkdir /app

COPY . /app

WORKDIR /app

RUN rm -rf node_modules package-lock.json pnpm-lock.yaml  && \
    npm i

EXPOSE 5173

CMD [ "npm", "run", "dev" ]
