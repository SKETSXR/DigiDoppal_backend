# # ---------- Stage 1: Build ----------
# FROM node:24-slim AS builder

# RUN corepack enable

# WORKDIR /app

# COPY package.json pnpm-lock.yaml* ./

# # Force PNPM to hoist all modules (required for TypeScript resolution in Docker)
# RUN pnpm config set node-linker hoisted
# RUN pnpm install --frozen-lockfile

# COPY . .

# # Build the TypeScript code
# RUN pnpm build


# # ---------- Stage 2: Production ----------
# FROM node:24-slim AS runner
# WORKDIR /app

# RUN corepack enable

# COPY package.json pnpm-lock.yaml* ./
# RUN pnpm install --prod --frozen-lockfile

# COPY --from=builder /app/dist ./dist

# # Copy any other required files (e.g., .env.example or migrations if needed)
# # COPY .env .env
# # COPY migrations ./migrations

# EXPOSE 3000

# CMD ["node", "dist/app.js"]


# ---------- Stage 1: Build ----------
FROM node:22-slim AS builder

RUN corepack enable

WORKDIR /app

RUN npm install pnpm@10.18.1

# Copy package files first
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Force PNPM hoisted layout (fixes TypeScript resolution)
RUN pnpm config set node-linker hoisted
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Copy non-TS config files (if any) to dist
COPY src/config ./dist/config


# ---------- Stage 2: Production ----------
FROM node:22-slim AS runner

WORKDIR /app
RUN corepack enable

# Copy production dependencies only
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Copy built app
COPY --from=builder /app/dist ./dist

# Copy environment file (if using dotenv)
COPY .env .env

EXPOSE 3000

CMD ["node", "dist/app.js"]

