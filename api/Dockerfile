# Bước 1: Sử dụng hình ảnh Maven để build dự án
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy toàn bộ code vào trong container
COPY . .

# Chạy lệnh build để tạo ra file .jar (bỏ qua chạy thử nghiệm để build nhanh hơn)
RUN mvn clean package -DskipTests

# Bước 2: Sử dụng hình ảnh Java gọn nhẹ để chạy app
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy file .jar đã build từ bước 1 sang bước 2
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080
EXPOSE 8080

# Lệnh khởi chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]