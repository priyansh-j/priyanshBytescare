# Use the official Puppeteer Docker image
FROM ghcr.io/puppeteer/puppeteer:latest

# Set the working directory in the container
WORKDIR /app

# Copy the Puppeteer script into the container
# Note: This assumes your script is named script.js in the same directory as the Dockerfile
COPY ./src /app/
COPY ./package.json /app/
COPY ./node_modules /app/

# RUN npm install

# Run the Puppeteer script when the container launches
# CMD ["node", "script.js"]
CMD sleep infinity
