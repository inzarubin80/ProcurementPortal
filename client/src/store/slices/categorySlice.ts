import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category, CategoryListResponse } from '../../types/api';
import { categoryApi } from '../../services/api';

// Состояние слайса
interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Начальное состояние
const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    hasNext: false,
    hasPrev: false,
  },
};

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number }) => {
    const response = await categoryApi.getCategories(page, pageSize);
    return response;
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (id: string) => {
    const response = await categoryApi.getCategory(id);
    return response;
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const response = await categoryApi.createCategory(category);
    return response;
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
    const response = await categoryApi.updateCategory(id, updates);
    return response;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string) => {
    await categoryApi.deleteCategory(id);
    return id;
  }
);

// Слайс
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    setCurrentCategory: (state, action: PayloadAction<Category>) => {
      state.currentCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchCategories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<CategoryListResponse>) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.page_size,
          total: action.payload.total,
          hasNext: action.payload.has_next,
          hasPrev: action.payload.has_prev,
        };
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });

    // fetchCategoryById
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch category';
      });

    // createCategory
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        state.categories.unshift(action.payload);
        state.currentCategory = action.payload;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create category';
      });

    // updateCategory
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.loading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.currentCategory?.id === action.payload.id) {
          state.currentCategory = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update category';
      });

    // deleteCategory
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
        if (state.currentCategory?.id === action.payload) {
          state.currentCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete category';
      });
  },
});

export const { clearError, clearCurrentCategory, setCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer; 