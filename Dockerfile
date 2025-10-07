# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for faster Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript project (if applicable)
RUN npm run build

# Expose app port
EXPOSE 10000

# Start the app
CMD ["npm", "run", "start"]
