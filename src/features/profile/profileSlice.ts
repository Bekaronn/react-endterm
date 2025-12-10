import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ProfileData = {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string | null;
};

interface ProfileState {
  data: ProfileData | null;
}

const initialState: ProfileState = {
  data: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<ProfileData | null>) {
      state.data = action.payload;
    },
  },
});

export const { setProfile } = profileSlice.actions;

export default profileSlice.reducer;

