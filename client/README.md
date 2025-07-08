# Language Learning Platform - Client

React приложение для изучения языков программирования с интерактивными упражнениями.

## Технологии

- React 18
- TypeScript
- Material-UI (MUI)
- Redux Toolkit
- React Router
- React Syntax Highlighter

## Возможности

- 🎯 Интерактивные упражнения по программированию
- 📝 Синтаксическая подсветка кода
- ⏱️ Отслеживание времени выполнения
- 📊 Статистика (WPM, точность)
- 🎨 Современный UI в стиле Twitter
- 📱 Адаптивный дизайн

## Установка и запуск

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Сборка для продакшена
npm run build

# Запуск тестов
npm test
```

### Docker

```bash
# Сборка образа
docker build -t language-learning-client .

# Запуск контейнера
docker run -p 3000:80 language-learning-client
```

## Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
├── pages/              # Страницы приложения
│   ├── Landing.tsx     # Главная страница
│   ├── SelectLanguage.tsx  # Выбор языка/упражнения
│   └── ExerciseCard.tsx    # Страница упражнения
├── services/           # API сервисы
│   └── api.ts         # API клиент
├── store/              # Redux store
│   ├── index.ts       # Конфигурация store
│   └── slices/        # Redux slices
├── types/              # TypeScript типы
│   └── api.ts         # API типы
└── theme.ts           # Material-UI тема
```

## API

Приложение взаимодействует с Go API сервером через следующие эндпоинты:

- `GET /api/v1/languages` - получение списка языков
- `GET /api/v1/exercises` - получение списка упражнений
- `GET /api/v1/exercises/:id` - получение упражнения по ID
- `POST /api/v1/sessions` - создание сессии тренировки

## Переменные окружения

- `REACT_APP_API_URL` - URL API сервера (по умолчанию: http://localhost:8090/api/v1)

## Лицензия

MIT 