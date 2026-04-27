FROM node:22-alpine AS build

WORKDIR /app

ARG REACT_APP_BACKEND_REST_API_URL
ENV REACT_APP_BACKEND_REST_API_URL=${REACT_APP_BACKEND_REST_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN test -n "$REACT_APP_BACKEND_REST_API_URL" || (echo "REACT_APP_BACKEND_REST_API_URL build arg is required" >&2; exit 1)
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
