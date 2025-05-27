# Codebase/frontend/Dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy package.json and lock file first for caching
COPY package*.json ./

# Install dependencies
RUN npm install # Use 'npm ci' if you have a package-lock.json and prefer stricter installs

# Copy the rest of the application code (will be mostly overridden by volume mount in dev)
COPY . .

# Vite's default dev port
EXPOSE 5173

# The CMD will be overridden by docker-compose.yml for 'npm run dev -- --host'
# CMD ["npm", "run", "dev"]