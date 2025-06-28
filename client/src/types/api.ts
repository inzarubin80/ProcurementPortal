export interface Language {
  id: number;
  name: string;
  description: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  language_id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: number;
  user_id: number;
  language_id: number;
  category_id: number;
  title: string;
  description: string;
  code: string;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts?: number;
  successful_attempts?: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  exercise_id: number;
  user_code: string;
  is_correct: boolean;
  time_spent: number; // milliseconds
  wpm: number; // words per minute
  accuracy: number; // percentage
  created_at: string;
}

export interface UserStats {
  total_sessions: number;
  correct_sessions: number;
  average_time: number;
  average_wpm: number;
  average_accuracy: number;
  best_time: number;
  best_wpm: number;
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