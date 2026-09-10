# ==========================================================
# STAGE 1: Build the Vite React Frontend
# ==========================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci --silent || npm install --silent

# Copy all source files
COPY . .

# Build production bundle
RUN npm run build

# ==========================================================
# STAGE 2: Serve with Lightweight Nginx
# ==========================================================
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
