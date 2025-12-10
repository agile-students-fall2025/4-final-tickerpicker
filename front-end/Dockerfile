# Frontend Dockerfile - Multi-stage build
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy root package files (for esbuild/tailwind build)
COPY package*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Install root dependencies (including dev dependencies for build)
RUN npm install

# Copy frontend source
COPY front-end ./front-end

# Build the frontend (builds CSS and JS to front-end/dist)
WORKDIR /app
RUN npm run build

# Production stage - serve static files with nginx
FROM nginx:alpine

# Copy built assets from builder stage
# Copy dist folder to /dist (for CSS and JS assets)
COPY --from=builder /app/front-end/dist /usr/share/nginx/html/dist
# Copy index.html to root
COPY --from=builder /app/front-end/index.html /usr/share/nginx/html/

# Copy nginx configuration
COPY front-end/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

