# Simple backend image for Node.js app
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
# copy prisma schema so prepare/install scripts that run prisma generate succeed
COPY backend/prisma ./prisma
# install all deps (including dev) to run tsc/prisma generate
RUN npm ci
COPY backend .
RUN npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
# install only production deps for smaller runtime image
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]
