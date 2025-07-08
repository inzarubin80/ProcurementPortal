# Build Stage
FROM node:lts-alpine AS build

# Создаем пользователя для безопасного выполнения
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Копируем package.json для кэширования зависимостей
COPY package*.json ./

# Копируем исходный код
COPY . .

# Создаем папку public если её нет и добавляем index.html
RUN mkdir -p public
RUN echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Language Learning Platform</title></head><body><div id="root"></div></body></html>' > public/index.html

# Устанавливаем зависимости (переустанавливаем для правильных прав доступа)
RUN npm install --legacy-peer-deps --silent

# Запускаем сборку от имени root (временно)
RUN npm run build

# Меняем владельца собранных файлов
RUN chown -R appuser:appgroup /app

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