FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Expose port 31090
EXPOSE 31091

# Start the application
CMD ["node", "index.js"]
