import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './features/jobs/jobsSlice';
import profileReducer from './features/profile/profileSlice';
import favoritesReducer from './features/favorites/favoritesSlice';

const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    favorites: favoritesReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

