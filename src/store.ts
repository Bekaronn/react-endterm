import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from './features/jobs/jobsSlice';
<<<<<<< HEAD
import profileReducer from './features/profile/profileSlice';
=======
import favoritesReducer from './features/favorites/favoritesSlice';
>>>>>>> 2600699ea5d2dbeb7ebd960562d41896612711d0

const store = configureStore({
  reducer: {
    jobs: jobsReducer,
<<<<<<< HEAD
    profile: profileReducer,
=======
    favorites: favoritesReducer,
>>>>>>> 2600699ea5d2dbeb7ebd960562d41896612711d0
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

