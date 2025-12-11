# Etapa de construcción
FROM node:18-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar variables de entorno
COPY .env .env

# Copiar el código fuente
COPY . .

# Compilar la aplicación (TypeScript + Vite)
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Limpiar el directorio por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos compilados desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
