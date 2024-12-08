# Stage 1: Development
FROM node:20.11 AS development

WORKDIR /backend

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose backend port for development
EXPOSE 4000

# Start the backend in development mode
CMD ["npm", "run", "dev"]
