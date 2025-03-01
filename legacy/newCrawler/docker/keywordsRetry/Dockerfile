# Use an official Node.js runtime as a parent image
FROM node:22-bullseye-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application code to the container
RUN mkdir src
COPY ./src ./src

# Run the application

ENV service=keywordsRetry

# CMD sleep infinity
CMD node src/bin/retry.js
