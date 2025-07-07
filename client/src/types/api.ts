export interface Language {
  id: number;
  name: string;
  description: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: UUID;
  user_id: number;
  name: string;
  description: string;
  programming_language: string;
  color: string;
  icon: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Exercise {
  id: UUID;
  user_id: number;
  title: string;
  description: string;
  category_id: UUID;
  difficulty: string;
  programming_language: string;
  code_to_remember: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_solved: boolean;
  is_user_exercise: boolean;
}

export interface UserStats {
  total_exercises: number;
  completed_exercises: number;
  average_score: number;
  total_time: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type UUID = string;

export interface ExerciseListResponse {
  exercises: Exercise[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface UserExercise {
  user_id: number;
  exercise_id: UUID;
  completed_at?: string;
  score?: number;
  attempts_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserExerciseWithDetails {
  user_id: number;
  exercise_id: UUID;
  completed_at?: string;
  score?: number;
  attempts_count: number;
  created_at: string;
  updated_at: string;
  exercise: Exercise;
}

export interface UserExerciseListResponse {
  user_exercises: UserExerciseWithDetails[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProgrammingLanguage {
  name: string;
  value: string;
  icon_svg: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface AuthProvider {
  Provider: string;
  ClientId: string;
  AuthURL: string;
  RedirectUri: string;
  IconSVG: string;
} 