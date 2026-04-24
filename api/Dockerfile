# Bước 1: Build dự án bằng Maven và Java 17 (Dùng Temurin)
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Bước 2: Chạy dự án bằng JRE 17 gọn nhẹ
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080 cho Render
EXPOSE 8080

# Lệnh khởi chạy
ENTRYPOINT ["java", "-jar", "app.jar"]