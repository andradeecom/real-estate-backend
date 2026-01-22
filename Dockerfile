
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production  # or pnpm install --prod

COPY . .
RUN npx prisma generate
EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]  
