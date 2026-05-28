FROM node:20.19.0-slim AS base

WORKDIR /app

COPY package*.json ./
# Install OpenSSL and CA certs (required by Prisma on some images), then install dependencies
RUN apt-get update && \
	apt-get install -y --no-install-recommends openssl ca-certificates libssl-dev && \
	rm -rf /var/lib/apt/lists/*

# Prevent npm from running lifecycle scripts during install (postinstall runs prisma generate and may fail
# inside the build image). We'll run `npx prisma generate` explicitly afterwards in a separate step.
RUN npm install --ignore-scripts

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
COPY README.md ./

RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]