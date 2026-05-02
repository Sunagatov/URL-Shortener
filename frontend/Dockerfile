FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_BACKEND_REST_API_URL
ARG VITE_GOOGLE_OAUTH_CLIENT_ID
ENV VITE_BACKEND_REST_API_URL=${VITE_BACKEND_REST_API_URL}
ENV VITE_GOOGLE_OAUTH_CLIENT_ID=${VITE_GOOGLE_OAUTH_CLIENT_ID}

COPY package*.json ./
RUN npm ci

COPY . .
RUN test -n "$VITE_BACKEND_REST_API_URL" || (echo "VITE_BACKEND_REST_API_URL build arg is required" >&2; exit 1)
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
