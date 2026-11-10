FROM node:22-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY package.json ./
COPY src ./src
USER node
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "src/main.js"]
