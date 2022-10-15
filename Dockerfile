FROM node:12.18.1

# Setup the main container
WORKDIR /app

EXPOSE 8000
EXPOSE 3000

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

RUN pip3 install requests_html
RUN pip3 install bs4
RUN conda activate base

CMD [ "npm", "start" ]