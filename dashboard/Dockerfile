FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose Vite preview port
EXPOSE 4173

# Run production preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
