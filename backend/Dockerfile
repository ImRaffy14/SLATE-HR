FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy source code and build
COPY . .

RUN yarn prisma generate
RUN yarn build

EXPOSE 5000

CMD ["node", "dist/server.js"]
