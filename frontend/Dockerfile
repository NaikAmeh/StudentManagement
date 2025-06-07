      
# /frontend/Dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy package.json and lock file(s) for dependency caching
COPY package*.json ./
# If you use yarn: COPY yarn.lock ./
# If you use pnpm: COPY pnpm-lock.yaml ./

# Install dependencies
# Use 'npm ci' for production/CI if you have package-lock.json for reproducible builds.
# For dev, 'npm install' is fine.
RUN npm install

# Copy the rest of the application code
# This will be largely overridden by volume mounts in docker-compose for development
COPY . .

# Vite's default development port
EXPOSE 5173

# The actual command to run the dev server will be specified in docker-compose.yml
CMD ["npm", "run", "dev", "--", "--host"]

    