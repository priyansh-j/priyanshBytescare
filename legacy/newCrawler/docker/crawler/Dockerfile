# Use the official Puppeteer Docker image
FROM ghcr.io/puppeteer/puppeteer:latest

# Set the working directory in the container
WORKDIR /app

# Copy the Puppeteer script into the container
# Note: This assumes your script is named script.js in the same directory as the Dockerfile
RUN mkdir src
COPY ./src /app/src
COPY ./package.json /app/

RUN npm install

ENV service=crawlers

# Run the Puppeteer script when the container launches
CMD node ./src/bin/newCrawler.js
# CMD sleep infinity

