# Use Node 20 LTS for better stability (Node 23 is not yet released)
FROM node:23-alpine

# Add necessary packages for Prisma and build
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# First copy only package files to leverage Docker cache
COPY package*.json yarn.lock ./
COPY prisma ./prisma/

# Install dependencies with specific flags for production
RUN yarn install --frozen-lockfile

# Generate Prisma client
RUN npx prisma generate

# Now copy the rest of the application
COPY . .

# Build the application (recommended even for dev)
RUN yarn build

EXPOSE 3000

# Add healthcheck (optional but recommended)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1))"

CMD ["yarn", "start:dev"]