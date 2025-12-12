import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './features/jobs/jobsSlice';
import profileReducer from './features/profile/profileSlice';
import favoritesReducer from './features/favorites/favoritesSlice';
import applicationsReducer from './features/applications/applicationsSlice';

const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    favorites: favoritesReducer,
    profile: profileReducer,
    applications: applicationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

