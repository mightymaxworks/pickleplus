FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY public/ ./public/

# Set to production environment
ENV NODE_ENV=production

# Use the PORT environment variable provided by Cloud Run
EXPOSE 8080

# Start the server on port 8080
CMD ["node", "-e", "require('./dist/index.js')"]