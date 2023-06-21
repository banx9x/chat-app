# Build frontend
FROM node:18-alpine as frontend
WORKDIR /
COPY frontend .
RUN npm ci
RUN npm run build

# Start backend
FROM node:18-alpine as backend
WORKDIR /
ENV DB_NAME=chatapp
ENV DB_URI=mongodb+srv://banx9x:hSVhv4K4nAYkNnO7@cluster0.fuayoos.mongodb.net/?retryWrites=true&w=majority
ENV JWT_SECRET_TOKEN=123456
ENV NODE_ENV=production
ENV PORT=3000
COPY backend .
RUN npm ci
COPY --from=frontend /dist /public
EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]