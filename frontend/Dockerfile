# frontend/Dockerfile

# --- Build Stage (Node.js) ---
FROM node:20-alpine AS build-stage
WORKDIR /app

# Copy package.json and lock file
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Based on your lock file, uncomment the correct install command
# RUN yarn install --frozen-lockfile
RUN npm ci
# RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the React application (Vite)
# The output should be in the 'dist' folder by default for Vite
RUN npm run build
# Or if using yarn:
# RUN yarn build
# Or if using pnpm:
# RUN pnpm build


# --- Production Stage (Nginx) ---
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy built assets from the build stage
COPY --from=build-stage /app/dist .

# Optional: Copy a custom Nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# If you don't provide a custom nginx.conf, it will use the Nginx default,
# which should serve index.html for the root and handle static assets correctly.

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]