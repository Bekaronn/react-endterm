import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './features/jobs/jobsSlice';
import favoritesReducer from './features/favorites/favoritesSlice';

const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

