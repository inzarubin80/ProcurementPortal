import { Language, Category, Exercise, PaginatedResponse, Session, UserStats, ExerciseListResponse, CategoryListResponse, ProgrammingLanguage, AuthProvider } from '../types/api';

// Базовый URL API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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
    credentials: 'include', // Отправляем куки для авторизации
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

// API для провайдеров авторизации
export const authProviderApi = {
  // Получение списка провайдеров
  async getProviders(): Promise<AuthProvider[]> {
    const response = await apiRequest<AuthProvider[]>('/providers');
    return response;
  },
};

// API для языков программирования
export const languageApi = {
  // Получение списка языков
  async getLanguages(): Promise<ProgrammingLanguage[]> {
    const response = await apiRequest<ProgrammingLanguage[]>('/languages');
    return response;
  },
};

// API для категорий
export const categoryApi = {
  // Получение списка категорий
  async getCategories(page: number = 1, pageSize: number = 10): Promise<CategoryListResponse> {
    const response = await apiRequest<CategoryListResponse>(`/categories?page=${page}&page_size=${pageSize}`);
    return response;
  },

  // Получение категории по ID
  async getCategory(id: string): Promise<Category> {
    const response = await apiRequest<Category>(`/categories/get?category_id=${id}`);
    return response;
  },

  // Создание категории
  async createCategory(category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const response = await apiRequest<Category>('/categories/create', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return response;
  },

  // Обновление категории
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const response = await apiRequest<Category>(`/categories/update?category_id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response;
  },

  // Удаление категории
  async deleteCategory(id: string): Promise<void> {
    await apiRequest<void>(`/categories/delete?category_id=${id}`, {
      method: 'DELETE',
    });
  },
};

// API для упражнений
export const exerciseApi = {
  // Получение списка упражнений
  async getExercises(page: number = 1, pageSize: number = 10): Promise<ExerciseListResponse> {
    const response = await apiRequest<ExerciseListResponse>(`/exercises?page=${page}&page_size=${pageSize}`);
    return response;
  },

  // Получение упражнения по ID
  async getExercise(id: string): Promise<Exercise> {
    const response = await apiRequest<Exercise>(`/exercises/get?exercise_id=${id}`);
    return response;
  },

  // Создание упражнения
  async createExercise(exercise: Omit<Exercise, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Exercise> {
    const response = await apiRequest<Exercise>('/exercises/create', {
      method: 'POST',
      body: JSON.stringify(exercise),
    });
    return response;
  },

  // Обновление упражнения
  async updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise> {
    const response = await apiRequest<Exercise>(`/exercises/update?exercise_id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response;
  },

  // Удаление упражнения
  async deleteExercise(id: string): Promise<void> {
    await apiRequest<void>(`/exercises/delete?exercise_id=${id}`, {
      method: 'DELETE',
    });
  },

  // Получение упражнений по языку программирования
  async getExercisesByLanguage(language: string, page: number = 1, pageSize: number = 10): Promise<ExerciseListResponse> {
    const response = await apiRequest<ExerciseListResponse>(`/exercises?programming_language=${language}&page=${page}&page_size=${pageSize}`);
    return response;
  },

  // Получение упражнений по категории
  async getExercisesByCategory(categoryId: string, page: number = 1, pageSize: number = 10): Promise<ExerciseListResponse> {
    const response = await apiRequest<ExerciseListResponse>(`/exercises?category_id=${categoryId}&page=${page}&page_size=${pageSize}`);
    return response;
  },
};

// API для сессий
export const sessionApi = {
  // Создание сессии
  async createSession(session: Omit<Session, 'id' | 'created_at'>): Promise<Session> {
    const response = await apiRequest<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
    return response;
  },

  // Получение сессии по ID
  async getSession(id: string): Promise<Session> {
    const response = await apiRequest<Session>(`/sessions/${id}`);
    return response;
  },

  // Получение сессий по упражнению
  async getSessionsByExercise(exerciseId: string): Promise<Session[]> {
    const response = await apiRequest<Session[]>(`/sessions/exercise/${exerciseId}`);
    return response;
  },
};

// API для статистики
export const statsApi = {
  // Получение статистики пользователя
  async getUserStats(): Promise<UserStats> {
    const response = await apiRequest<UserStats>('/stats/user');
    return response;
  },

  // Получение статистики по упражнению
  async getExerciseStats(exerciseId: string): Promise<UserStats> {
    const response = await apiRequest<UserStats>(`/stats/exercise/${exerciseId}`);
    return response;
  },
};

// Проверка здоровья API
export const healthApi = {
  async checkHealth(): Promise<{ status: string; message: string }> {
    const response = await apiRequest<{ status: string; message: string }>('/ping');
    return response;
  },
}; 