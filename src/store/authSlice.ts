import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'incharge' | 'teacher';
  school_id: number;
  school?: {
    id: number;
    name: string;
  };
}

interface AuthState {
  user: User | null;
  access_token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  access_token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User; access_token: string }>) => {
      state.user = action.payload.user
      state.access_token = action.payload.access_token
      state.isAuthenticated = true
      localStorage.setItem('access_token', action.payload.access_token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    logout: (state) => {
      state.user = null
      state.access_token = null
      state.isAuthenticated = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    },
  },
})

export const { setAuth, logout } = authSlice.actions
export default authSlice.reducer
