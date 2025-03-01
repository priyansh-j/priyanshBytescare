# Express Dockerfile
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Start the server
CMD ["node", "status_checker/express.js"]



# # Dockerfile for interface_server
# FROM node:18-slim

# WORKDIR /myapp

# COPY . /myapp

# # Install Chrome and dependencies
# RUN apt-get update && \
#     apt-get install -y curl gnupg && \
#     curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
#     echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
#     apt-get update && \
#     apt-get install -y google-chrome-stable && \
#     rm -rf /var/lib/apt/lists/*

# RUN npm install
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
# EXPOSE 8080
# CMD ["node", "status_checker/express.js"]

