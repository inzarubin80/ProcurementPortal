import { authAxios } from './http-common';
import { ExerciseListWithUserResponse } from '../types/api';

export interface UserExercisesFilters {
  programming_language?: string;
  category_id?: number;
  page?: number;
  page_size?: number;
}

export const userExercisesApi = {
  // Получить список задач пользователя
  getUserExercises: async (filters: UserExercisesFilters = {}): Promise<ExerciseListWithUserResponse> => {
    const params = new URLSearchParams();
    
    if (filters.programming_language) {
      params.append('programming_language', filters.programming_language);
    }
    if (filters.category_id !== undefined) {
      params.append('category_id', filters.category_id.toString());
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
  getUserExercisesFiltered: async (filters: UserExercisesFilters): Promise<ExerciseListWithUserResponse> => {
    return userExercisesApi.getUserExercises(filters);
  },

  // Добавить упражнение пользователю
  addUserExercise: async (exerciseId: number): Promise<void> => {
    await authAxios.post(`/user/exercises/add?exercise_id=${exerciseId.toString()}`);
  },

  // Удалить упражнение из списка пользователя
  removeUserExercise: async (exerciseId: number): Promise<void> => {
    await authAxios.delete(`/user/exercises/remove?exercise_id=${exerciseId.toString()}`);
  }
}; 