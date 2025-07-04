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

# Запускаем сборку через npm script (исправлено для решения проблемы с правами доступа)
RUN npm run build

# Production Stage
# Вариант 1: Nginx (может быть заблокирован лимитами)
# FROM nginx:1.25-alpine AS production
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 3000
# CMD ["nginx", "-g", "daemon off;"]

# Вариант 2: Node.js веб-сервер (альтернатива nginx)
FROM node:lts-alpine AS production

# Создаем пользователя для безопасного выполнения
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Устанавливаем serve для раздачи статических файлов
RUN npm install -g serve

# Копируем собранные файлы
COPY --from=build /app/build ./build

# Меняем владельца
RUN chown -R appuser:appgroup /app

# Переключаемся на непривилегированного пользователя
USER appuser

# Открываем порт 3000
EXPOSE 3000

# Запускаем веб-сервер
CMD ["serve", "-s", "build", "-l", "3000"]