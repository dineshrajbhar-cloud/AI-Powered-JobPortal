FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN ./mvnw clean package -DskipTests

EXPOSE 9090

CMD ["java", "-jar", "target/jobportal-0.0.1-SNAPSHOT.jar"]