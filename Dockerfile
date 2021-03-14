FROM node:11-alpine as build-stage

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY . /home/node/app/

RUN sed -i 's/react-scripts build/react-scripts --max_old_space_size=4096 build/g' /home/node/app/package.json

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_OPTIONS "--max-old-space-size=4096"
RUN npm install
RUN npm run build

FROM nginx:1.15

# ngx_cache_purge build is based on https://hub.docker.com/r/procraft/nginx-purge/dockerfile on newer nginx

ENV NGX_CACHE_PURGE_VERSION=2.5.1

# Install basic packages and build tools
RUN apt-get update && \
    apt-get install --no-install-recommends --no-install-suggests -y \
      wget \
      build-essential \
      ca-certificates \
      libssl-dev \
      libpcre3 \
      libpcre3-dev \
      zlib1g \
      zlib1g-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# download and extract sources
RUN NGINX_VERSION=`nginx -V 2>&1 | grep "nginx version" | awk -F/ '{ print $2}'` && \
    cd /tmp && \
    wget http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz && \
    wget https://github.com/nginx-modules/ngx_cache_purge/archive/$NGX_CACHE_PURGE_VERSION.tar.gz \
         -O ngx_cache_purge-$NGX_CACHE_PURGE_VERSION.tar.gz && \
    tar -xf nginx-$NGINX_VERSION.tar.gz && \
    mv nginx-$NGINX_VERSION nginx && \
    rm nginx-$NGINX_VERSION.tar.gz && \
    tar -xf ngx_cache_purge-$NGX_CACHE_PURGE_VERSION.tar.gz && \
    mv ngx_cache_purge-$NGX_CACHE_PURGE_VERSION ngx_cache_purge && \
    rm ngx_cache_purge-$NGX_CACHE_PURGE_VERSION.tar.gz

# configure and build
RUN cd /tmp/nginx && \
    BASE_CONFIGURE_ARGS=`nginx -V 2>&1 | grep "configure arguments" | cut -d " " -f 3-` && \
    /bin/sh -c "./configure ${BASE_CONFIGURE_ARGS} --add-module=/tmp/ngx_cache_purge" && \
    make && make install && \
    rm -rf /tmp/nginx*

COPY --from=build-stage /home/node/app/build/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /usr/local/bin/entrypoint
EXPOSE 80
ENTRYPOINT [ "entrypoint" ]
CMD ["nginx", "-g", "daemon off;"]
