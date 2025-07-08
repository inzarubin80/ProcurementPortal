import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProgrammingLanguage } from '../../types/api';
import { publicAxios } from '../../service/http-common';

interface LanguageState {
  languages: ProgrammingLanguage[];
  loading: boolean;
  error: string | null;
}

const initialState: LanguageState = {
  languages: [],
  loading: false,
  error: null,
};

export const fetchLanguages = createAsyncThunk(
  'languages/fetchLanguages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await publicAxios.get('/languages');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch languages');
    }
  }
);

const languageSlice = createSlice({
  name: 'languages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action: PayloadAction<ProgrammingLanguage[]>) => {
        state.loading = false;
        state.languages = action.payload;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch languages';
      });
  },
});

export const { clearError } = languageSlice.actions;
export default languageSlice.reducer; 