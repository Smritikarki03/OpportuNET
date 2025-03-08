import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null, // Store user details here
  isAuthenticated: false, // Track login status
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload; // Set user details
      state.isAuthenticated = true; // Set login status to true
    },
    logout: (state) => {
      state.user = null; // Clear user details
      state.isAuthenticated = false; // Set login status to false
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;