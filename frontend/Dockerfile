# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy all source code and build
COPY . .
RUN yarn build

# Serve stage
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN yarn global add serve

# Copy built files from previous stage
COPY --from=builder /app/dist .

EXPOSE 3005

CMD ["serve", "-s", ".", "-l", "3005"]
