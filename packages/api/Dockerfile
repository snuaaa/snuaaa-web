FROM node:20

WORKDIR /home/node/

# 작업 디렉토리 생성
WORKDIR /usr/src/app

# 의존성 먼저 복사 (캐시 최적화)
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080

CMD [ "node", "dist/main.js" ]
