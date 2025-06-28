import { Language, Category, Exercise, PaginatedResponse, Session, UserStats } from '../types/api';

// Базовый URL API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Общий тип для API ответов
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Общая функция для HTTP запросов
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// API для языков
export const languageApi = {
  // Получение списка языков
  async getLanguages(): Promise<Language[]> {
    // Моковые данные для демонстрации
    const mockLanguages: Language[] = [
      {
        id: 1,
        name: 'JavaScript',
        description: 'Язык программирования для веб-разработки',
        icon: '⚡',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Python',
        description: 'Универсальный язык программирования',
        icon: '🐍',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 3,
        name: 'Go',
        description: 'Язык программирования от Google',
        icon: '🚀',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 4,
        name: 'Rust',
        description: 'Системный язык программирования',
        icon: '🦀',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 5,
        name: 'TypeScript',
        description: 'Типизированный JavaScript',
        icon: '📘',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];
    
    return mockLanguages;
  },

  // Получение языка по ID
  async getLanguage(id: string): Promise<Language> {
    const languages = await this.getLanguages();
    const language = languages.find(l => l.id.toString() === id);
    if (!language) {
      throw new Error('Language not found');
    }
    return language;
  },

  // Добавление языка
  async addLanguage(language: Omit<Language, 'id' | 'created_at' | 'updated_at'>): Promise<Language> {
    return apiRequest<Language>('/languages', {
      method: 'POST',
      body: JSON.stringify(language),
    });
  },

  // Обновление языка
  async updateLanguage(id: string, updates: Partial<Language>): Promise<Language> {
    return apiRequest<Language>(`/languages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Удаление языка
  async deleteLanguage(id: string): Promise<void> {
    return apiRequest<void>(`/languages/${id}`, {
      method: 'DELETE',
    });
  },
};

// API для категорий
export const categoryApi = {
  // Получение списка категорий
  async getCategories(languageId?: string): Promise<Category[]> {
    // Моковые данные для демонстрации
    const mockCategories: Category[] = [
      { id: 1, user_id: 1, language_id: 1, name: 'Основы', description: '', created_at: '', updated_at: '' },
      { id: 2, user_id: 1, language_id: 1, name: 'Функции', description: '', created_at: '', updated_at: '' },
      { id: 3, user_id: 1, language_id: 1, name: 'Циклы', description: '', created_at: '', updated_at: '' },
      { id: 4, user_id: 1, language_id: 2, name: 'Переменные', description: '', created_at: '', updated_at: '' },
      { id: 5, user_id: 1, language_id: 2, name: 'Математика', description: '', created_at: '', updated_at: '' },
    ];
    if (languageId) {
      return mockCategories.filter(c => c.language_id.toString() === languageId);
    }
    return mockCategories;
  },

  // Добавление категории
  async addCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Category>> {
    const newCategory = await apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return {
      success: true,
      data: newCategory,
      message: 'Категория успешно добавлена'
    };
  },

  // Обновление категории
  async updateCategory(id: string, updates: Partial<Category>): Promise<ApiResponse<Category>> {
    const updatedCategory = await apiRequest<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return {
      success: true,
      data: updatedCategory,
      message: 'Категория успешно обновлена'
    };
  },

  // Удаление категории
  async deleteCategory(id: string): Promise<ApiResponse<boolean>> {
    await apiRequest<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      data: true,
      message: 'Категория успешно удалена'
    };
  },
};

// API для упражнений
export const exerciseApi = {
  // Получение списка упражнений
  async getExercises(): Promise<Exercise[]> {
    // Моковые данные для демонстрации
    const mockExercises: Exercise[] = [
      {
        id: 1,
        user_id: 1,
        language_id: 1,
        category_id: 1,
        title: 'Hello World',
        description: 'Напишите программу, которая выводит "Hello, World!"',
        code: 'console.log("Hello, World!");',
        difficulty: 'easy',
        attempts: 15,
        successful_attempts: 12,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        user_id: 1,
        language_id: 1,
        category_id: 1,
        title: 'Переменные',
        description: 'Создайте переменную и присвойте ей значение',
        code: 'let name = "John";\nconsole.log(name);',
        difficulty: 'easy',
        attempts: 8,
        successful_attempts: 7,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 3,
        user_id: 1,
        language_id: 1,
        category_id: 2,
        title: 'Функция суммы',
        description: 'Напишите функцию, которая возвращает сумму двух чисел',
        code: 'function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(5, 3));',
        difficulty: 'medium',
        attempts: 12,
        successful_attempts: 9,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 4,
        user_id: 1,
        language_id: 2,
        category_id: 3,
        title: 'Python Hello',
        description: 'Напишите программу на Python для вывода приветствия',
        code: 'print("Hello, World!")',
        difficulty: 'easy',
        attempts: 6,
        successful_attempts: 6,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 5,
        user_id: 1,
        language_id: 2,
        category_id: 3,
        title: 'Список в Python',
        description: 'Создайте список и добавьте в него элементы',
        code: 'numbers = [1, 2, 3, 4, 5]\nnumbers.append(6)\nprint(numbers)',
        difficulty: 'medium',
        attempts: 10,
        successful_attempts: 8,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 6,
        user_id: 1,
        language_id: 3,
        category_id: 4,
        title: 'Go структура',
        description: 'Создайте структуру в Go',
        code: 'package main\n\nimport "fmt"\n\ntype Person struct {\n    Name string\n    Age  int\n}\n\nfunc main() {\n    p := Person{Name: "Alice", Age: 30}\n    fmt.Println(p)\n}',
        difficulty: 'hard',
        attempts: 5,
        successful_attempts: 3,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];
    
    return mockExercises;
  },

  // Получение упражнения по ID
  async getExercise(id: string): Promise<Exercise> {
    const exercises = await this.getExercises();
    const exercise = exercises.find(e => e.id.toString() === id);
    if (!exercise) {
      throw new Error('Exercise not found');
    }
    return exercise;
  },

  // Получение упражнений по языку
  async getExercisesByLanguage(languageId: string): Promise<Exercise[]> {
    const exercises = await this.getExercises();
    return exercises.filter(e => e.language_id.toString() === languageId);
  },

  // Добавление упражнения
  async addExercise(exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at'>): Promise<Exercise> {
    return apiRequest<Exercise>('/exercises', {
      method: 'POST',
      body: JSON.stringify(exercise),
    });
  },

  // Обновление упражнения
  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    return apiRequest<Exercise>(`/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Удаление упражнения
  async deleteExercise(id: string): Promise<void> {
    return apiRequest<void>(`/exercises/${id}`, {
      method: 'DELETE',
    });
  },
};

// API для сессий тренировки
export const sessionApi = {
  // Создание новой сессии
  async createSession(session: Omit<Session, 'id' | 'created_at'>): Promise<Session> {
    return apiRequest<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },

  // Получение сессии по ID
  async getSession(id: string): Promise<Session> {
    return apiRequest<Session>(`/sessions/${id}`);
  },

  // Получение сессий по упражнению
  async getSessionsByExercise(exerciseId: string): Promise<Session[]> {
    return apiRequest<Session[]>(`/exercises/${exerciseId}/sessions`);
  },

  // Получение статистики пользователя
  async getUserStats(exerciseId: string): Promise<UserStats> {
    return apiRequest<UserStats>(`/exercises/${exerciseId}/stats`);
  },
};

// API для проверки здоровья сервера
export const healthApi = {
  async checkHealth(): Promise<{ status: string; message: string }> {
    return apiRequest<{ status: string; message: string }>('/health');
  },
}; 