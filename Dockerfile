# DOCKER-VERSION 1.10.2

FROM node:4-onbuild
MAINTAINER Sean Dohring, seandohring@gmail.com

RUN npm install --save botkit && npm install --save googleapis

EXPOSE 8080
