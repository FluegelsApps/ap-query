FROM node:12.18.1

WORKDIR /app

EXPOSE 8000

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

CMD [ "node", "app.js" ]