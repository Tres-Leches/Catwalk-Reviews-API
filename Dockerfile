FROM node:12-alpine
RUN apk add --no-cache python g++ make
WORKDIR /Catwalk-Reiews-API
COPY . .
RUN npm install
CMD ["node", "server/app.js"]