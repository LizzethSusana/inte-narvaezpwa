# Etapa de construcción
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copiar pom.xml y descargar dependencias
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copiar código fuente
COPY src src

# Compilar la aplicación (salta tests para acelerar build)
RUN ./mvnw clean package -DskipTests

# Etapa de producción
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar el JAR compilado desde la etapa de build
COPY --from=build /app/target/*.jar app.jar

# Crear directorio para uploads
RUN mkdir -p /app/uploads

# Exponer puerto 8080
EXPOSE 8080

# Comando para iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]