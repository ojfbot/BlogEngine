import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Article {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  contentType: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  readingTime: number;
}

interface ContentState {
  articles: Article[];
  selectedArticle: Article | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ContentState = {
  articles: [],
  selectedArticle: null,
  isLoading: false,
  error: null,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setArticles: (state, action: PayloadAction<Article[]>) => {
      state.articles = action.payload;
    },
    setSelectedArticle: (state, action: PayloadAction<Article | null>) => {
      state.selectedArticle = action.payload;
    },
    addArticle: (state, action: PayloadAction<Article>) => {
      state.articles.unshift(action.payload);
    },
    updateArticle: (state, action: PayloadAction<Article>) => {
      const index = state.articles.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.articles[index] = action.payload;
      }
      if (state.selectedArticle?.id === action.payload.id) {
        state.selectedArticle = action.payload;
      }
    },
    deleteArticle: (state, action: PayloadAction<string>) => {
      state.articles = state.articles.filter(a => a.id !== action.payload);
      if (state.selectedArticle?.id === action.payload) {
        state.selectedArticle = null;
      }
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setArticles,
  setSelectedArticle,
  addArticle,
  updateArticle,
  deleteArticle,
  setIsLoading,
  setError,
} = contentSlice.actions;

export default contentSlice.reducer;
