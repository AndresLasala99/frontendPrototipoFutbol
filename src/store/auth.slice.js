import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authApi from "../api/auth.api";

const usuarioGuardado = localStorage.getItem("usuario");

const initialState = {
  usuario: usuarioGuardado ? JSON.parse(usuarioGuardado) : null,
  token: localStorage.getItem("token") || null,
  cargando: false,
  error: null,
};

export const loginThunk = createAsyncThunk("auth/login", async (credenciales, { rejectWithValue }) => {
  try {
    return await authApi.login(credenciales);
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || "No se pudo iniciar sesión");
  }
});

export const registroThunk = createAsyncThunk("auth/registro", async (datos, { rejectWithValue }) => {
  try {
    return await authApi.registro(datos);
  } catch (error) {
    return rejectWithValue(error.response?.data?.error || "No se pudo registrar el usuario");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.usuario = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.cargando = false;
        state.usuario = action.payload.usuario;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("usuario", JSON.stringify(action.payload.usuario));
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      .addCase(registroThunk.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(registroThunk.fulfilled, (state, action) => {
        state.cargando = false;
        state.usuario = action.payload.usuario;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("usuario", JSON.stringify(action.payload.usuario));
      })
      .addCase(registroThunk.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
