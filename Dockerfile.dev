FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install -g npm@11.6.2
RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "dev"]