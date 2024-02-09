# Stage 1: Build the React app
FROM node:slim as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2: Serve the production build
# Stage 2: Serve the production build
FROM node:slim
WORKDIR /app
COPY --from=build-stage /app ./
EXPOSE 3000
CMD ["node", "server.js"]