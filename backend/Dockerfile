FROM node:18-alpine

WORKDIR /app

# Add tools needed by yt-dlp
RUN apk add --no-cache python3 ffmpeg

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
