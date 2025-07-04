# Build Stage
FROM node:lts-alpine AS build

# Создаем пользователя для безопасного выполнения
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Копируем и устанавливаем зависимости
COPY package*.json ./
RUN npm install --legacy-peer-deps --silent

# Копируем исходный код и меняем владельца
COPY . .
RUN chown -R appuser:appgroup /app

# Переключаемся на непривилегированного пользователя
USER appuser

# Запускаем сборку (используем явный путь к react-scripts)
RUN ./node_modules/.bin/react-scripts build

# Production Stage
FROM nginx:alpine AS production

# Копируем кастомную конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранные файлы
COPY --from=build /app/build /usr/share/nginx/html

# Открываем порт 3000
EXPOSE 3000

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]