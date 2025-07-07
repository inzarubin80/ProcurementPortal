import { authAxios } from './http-common';
import { UserExerciseListResponse } from '../types/api';

export interface UserExercisesFilters {
  programming_language?: string;
  category_id?: string;
  difficulty?: string;
  page?: number;
  page_size?: number;
}

export const userExercisesApi = {
  // Получить список задач пользователя
  getUserExercises: async (filters: UserExercisesFilters = {}): Promise<UserExerciseListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.programming_language) {
      params.append('programming_language', filters.programming_language);
    }
    if (filters.category_id) {
      params.append('category_id', filters.category_id);
    }
    if (filters.difficulty) {
      params.append('difficulty', filters.difficulty);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.page_size) {
      params.append('page_size', filters.page_size.toString());
    }

    const response = await authAxios.get(`/user/exercises?${params.toString()}`);
    return response.data;
  },

  // Получить список задач пользователя с фильтрацией
  getUserExercisesFiltered: async (filters: UserExercisesFilters): Promise<UserExerciseListResponse> => {
    return userExercisesApi.getUserExercises(filters);
  },

  // Добавить упражнение пользователю
  addUserExercise: async (exerciseId: string): Promise<void> => {
    await authAxios.post(`/user/exercises/add?exercise_id=${exerciseId}`);
  },

  // Удалить упражнение из списка пользователя
  removeUserExercise: async (exerciseId: string): Promise<void> => {
    await authAxios.delete(`/user/exercises/remove?exercise_id=${exerciseId}`);
  }
}; 