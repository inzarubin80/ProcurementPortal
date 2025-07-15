# Build Stage
FROM node:lts-alpine AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json для кэширования зависимостей
COPY package*.json ./

# Копируем ВСЕ файлы, включая public/ и исходный код
COPY . .

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Собираем приложение
RUN npm run build

# Production Stage (используем nginx для лучшей производительности)
FROM nginx:1.25-alpine AS production

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранные файлы из стадии build
COPY --from=build /app/build /usr/share/nginx/html

# Даем права nginx на доступ к файлам
RUN chmod -R 755 /usr/share/nginx/html

# Открываем порт 80 (стандартный для nginx)
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]