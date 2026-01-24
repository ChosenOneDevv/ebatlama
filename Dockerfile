# TurNest - 1D Cutting Stock Optimization
# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-slim AS production

# Install system dependencies for PDFKit (fontconfig, etc.)
RUN apt-get update && apt-get install -y \
    libfontconfig1 \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy backend source
COPY backend/src ./src

# Copy backend data files (materials, projects)
COPY backend/data ./data

# Copy frontend build from builder stage to public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Labels for Docker Hub
LABEL org.opencontainers.image.title="TurNest"
LABEL org.opencontainers.image.description="1D Cutting Stock Optimization for aluminum and steel profiles"
LABEL org.opencontainers.image.source="https://github.com/ChosenOneDevv/turnest"
LABEL org.opencontainers.image.licenses="MIT"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "src/index.js"]
