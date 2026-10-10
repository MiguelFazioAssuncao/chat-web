FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN groupadd --system chatweb && useradd --system --gid chatweb chatweb && mkdir uploads && chown chatweb:chatweb uploads
COPY --from=build /build/target/chatweb-0.0.1-SNAPSHOT.jar app.jar
USER chatweb
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65.0 -XX:+UseSerialGC"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
