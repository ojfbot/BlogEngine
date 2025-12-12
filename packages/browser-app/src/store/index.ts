import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './slices/navigationSlice';
import chatReducer from './slices/chatSlice';
import contentReducer from './slices/contentSlice';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    chat: chatReducer,
    content: contentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
