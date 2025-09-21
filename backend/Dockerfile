# Use Node.js base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy backend code
COPY . .

# Expose backend port (e.g., 5000)
EXPOSE 5000

# Start the server
CMD ["node", "src/app.js"]
