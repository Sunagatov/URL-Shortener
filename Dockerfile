# =============================================================================
# BUILD STAGE
# =============================================================================
FROM gradle:8.14-jdk21 AS build

WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle/
COPY gradlew ./
COPY src ./src/
RUN gradle bootJar --no-daemon -x test

# =============================================================================
# RUNTIME STAGE
# =============================================================================
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="Zufar Sunagatov" \
      description="URL Shortener Service"

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=60.0", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-XX:+UseG1GC", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
