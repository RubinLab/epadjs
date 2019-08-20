FROM keymetrics/pm2:latest-alpine
#FROM node:10.16-alpine
#RUN npm install pm2 -g
WORKDIR /app

COPY src /app/src/
COPY public /app/public/
COPY .babelrc /app/.
COPY ecosystem.config.js /app/.
COPY package.json /app/.
#COPY semantic.json /app/.
COPY epadjs/webpack.config.js /app/.

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install 

#COPY node_modules/cornerstone-tools/dist/* /app/node_modules/cornerstone-tools/dist/
#COPY node_modules/jquery /app/node_modules/jquery
COPY node_modules/semantic-ui/dist/semantic.js /app/node_modules/semantic-ui/dist/.
# Expose the listening port of your app
EXPOSE 3000

# Show current folder structure in logs
# RUN ls -al -R

#CMD [ "npm", "start" ]
CMD [ "pm2-runtime","--name","ePADjs","./node_modules/react-scripts/scripts/start.js" ]
#CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]

