# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
ARG REACT_APP_API_URL
ARG REACT_APP_RECAPTCHA_SITE_KEY
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_RECAPTCHA_SITE_KEY=${REACT_APP_RECAPTCHA_SITE_KEY}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
# Use default Nginx config; host-level Nginx Proxy Manager will handle routing
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 