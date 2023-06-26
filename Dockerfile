# Build frontend
FROM node:18-alpine as frontend
WORKDIR /app
COPY frontend/ /app/
RUN npm ci
RUN npm run build

# Start backend
FROM node:18-alpine as backend
WORKDIR /app
ENV DB_NAME=chatapp
ENV DB_URI=mongodb+srv://banx9x:hSVhv4K4nAYkNnO7@cluster0.fuayoos.mongodb.net/?retryWrites=true&w=majority
ENV JWT_SECRET_TOKEN=123456
ENV NODE_ENV=production
ENV PORT=80
COPY backend/ /app/
RUN npm ci
COPY --from=frontend /app/dist/ /app/public/
EXPOSE 80
ENTRYPOINT [ "npm", "start" ]