# TimeMaster — Управление временем и задачами

Веб-приложение для автоматизированного управления задачами, проектами и временем на базе NestJS и React.

## Что умеет приложение

- Авторизация через JWT (регистрация, вход, выход).
- Управление проектами (CRUD, цветовая маркировка).
- Управление задачами (CRUD, фильтрация по проекту/статусу/приоритету, поиск).
- Заметки — создание, редактирование, удаление, закрепление, теги, поиск.
- Отчёты — круговая диаграмма времени по проектам, фильтр по периоду.
- Экспорт данных — CSV и PDF с поддержкой кириллицы.
- Тёмная тема — переключение светлой/тёмной, сохранение выбора.
- Уведомления — всплывающие сообщения о дедлайнах (сегодня/завтра/просроченные).
- Файлы — загрузка, скачивание, удаление файлов к проектам и задачам.
- Комментарии — обсуждение задач.

## Технологии

| Слой | Стек |
|------|------|
| Backend | NestJS, TypeScript, MongoDB, Mongoose, JWT |
| Frontend | React, TypeScript, Redux Toolkit, React Router, Axios |
| Графики | Recharts |
| Экспорт PDF | html2canvas, jspdf |
| Уведомления | react-hot-toast |
| Drag-and-drop | react-dropzone |
| Контейнеризация | Docker, Docker Compose |

## Быстрый старт (Docker)

```bash
git clone <repo-url>
cd time-master
cp backend/.env.example backend/.env
# Задать JWT_SECRET в backend/.env
docker-compose up -d --build
```

Приложение: http://localhost

## Локальный запуск

```bash
# Backend
cd backend
npm install
npm run start:dev   # http://localhost:3001

# Frontend (отдельный терминал)
cd frontend
npm install
npm run dev         # http://localhost:5173
```

## Переменные окружения

### Backend (.env)

| Переменная | Обязательна | По умолчанию |
|------------|-------------|--------------|
| MONGODB_URI | да | mongodb://localhost:27017/time-master |
| JWT_SECRET | да | — |
| PORT | нет | 3001 |

## API Эндпоинты

**Базовый URL:** http://localhost:3001

### Аутентификация

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /auth/signup | Регистрация |
| POST | /auth/signin | Вход (возвращает JWT) |

### Проекты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /projects | Список проектов |
| POST | /projects | Создать проект |
| GET | /projects/{id} | Получить проект |
| PUT | /projects/{id} | Обновить проект |
| DELETE | /projects/{id} | Удалить проект |

### Задачи

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /tasks | Список задач (фильтрация) |
| POST | /tasks | Создать задачу |
| GET | /tasks/{id} | Получить задачу |
| PUT | /tasks/{id} | Обновить задачу |
| DELETE | /tasks/{id} | Удалить задачу |

**Параметры фильтрации GET /tasks:** project, status, priority

### Таймер

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /time-entries/start | Запустить таймер |
| POST | /time-entries/stop | Остановить таймер |
| GET | /time-entries/task/{taskId} | Временные записи |

### Заметки

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /notes | Список заметок |
| POST | /notes | Создать заметку |
| PUT | /notes/{id} | Обновить заметку |
| PUT | /notes/{id}/pin | Закрепить/открепить |
| DELETE | /notes/{id} | Удалить заметку |

### Отчёты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /reports/by-projects | Время по проектам |

**Параметры:** start, end (YYYY-MM-DD)

### Файлы

| Метод | Путь | Описание |
|-------|------|----------|
| POST | /files/upload | Загрузить файл |
| GET | /files/project/{projectId} | Файлы проекта |
| GET | /files/task/{taskId} | Файлы задачи |
| GET | /files/download/{id} | Скачать |
| DELETE | /files/{id} | Удалить |

### Комментарии

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /comments/task/{taskId} | Комментарии задачи |
| POST | /comments | Добавить комментарий |
| DELETE | /comments/{id} | Удалить комментарий |

## Команды

### Backend

| Команда | Описание |
|---------|----------|
| npm run start:dev | Запуск (hot-reload) |
| npm run build | Сборка |
| npm run start:prod | Запуск сборки |
| npm run test | Тесты |
| npm run lint | Линтинг |

### Frontend

| Команда | Описание |
|---------|----------|
| npm run dev | Запуск dev сервера |
| npm run build | Сборка |
| npm run preview | Предпросмотр |
| npm run test | Тесты |
| npm run lint | Линтинг |

## Структура проекта

```
time-master/
├── backend/
│   ├── src/
│   │   ├── auth/              # JWT аутентификация
│   │   ├── users/             # Пользователи
│   │   ├── projects/          # Проекты
│   │   ├── tasks/             # Задачи
│   │   ├── notes/             # Заметки
│   │   ├── reports/           # Отчёты
│   │   ├── comments/          # Комментарии
│   │   ├── files/             # Файлы
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── uploads/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Лицензия

MIT
