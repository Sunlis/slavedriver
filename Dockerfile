# DOCKER-VERSION 1.10.2

FROM node:4-onbuild
MAINTAINER Sean Dohring, seandohring@gmail.com

RUN npm install --save botkit

EXPOSE 8080
