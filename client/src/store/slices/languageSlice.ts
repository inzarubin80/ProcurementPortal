import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Language } from '../../types/api';
import { languageApi } from '../../services/api';

interface LanguageState {
  languages: Language[];
  loading: boolean;
  error: string | null;
}

const initialState: LanguageState = {
  languages: [],
  loading: false,
  error: null,
};

export const fetchLanguages = createAsyncThunk(
  'language/fetchLanguages',
  async () => {
    const response = await languageApi.getLanguages();
    return response;
  }
);

const languageSlice = createSlice({
  name: 'language',
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
      .addCase(fetchLanguages.fulfilled, (state, action: PayloadAction<Language[]>) => {
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