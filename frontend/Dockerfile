FROM node:20.11 as build-stage

WORKDIR /frontend
COPY . .
RUN npm install

# Api = 

# RUN npm run start

# # Stage 2
# FROM nginx:1.17.0-alpine

# COPY --from=build-stage /frontend/build /usr/share/nginx/html
# EXPOSE 3000

# CMD nginx -g 'daemon off;'
