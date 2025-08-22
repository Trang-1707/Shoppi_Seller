# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
# Copy only node_modules from deps layer for better caching
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY server.js ./
COPY env-check.js ./
COPY src ./src

EXPOSE 9999
CMD ["node", "server.js"] 