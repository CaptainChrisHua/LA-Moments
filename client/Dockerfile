# Build stage
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build

# Serve stage using Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose default Nginx port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
