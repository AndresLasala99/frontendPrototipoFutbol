import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as jugadoresApi from "../api/jugadores.api";

export const cargarJugadores = createAsyncThunk("jugadores/cargar", async () => {
  return jugadoresApi.listarJugadores();
});

export const crearJugadorThunk = createAsyncThunk("jugadores/crear", async (datos) => {
  return jugadoresApi.crearJugador(datos);
});

export const editarJugadorThunk = createAsyncThunk("jugadores/editar", async ({ id, datos }) => {
  return jugadoresApi.editarJugador(id, datos);
});

export const eliminarJugadorThunk = createAsyncThunk("jugadores/eliminar", async (id) => {
  await jugadoresApi.eliminarJugador(id);
  return id;
});

const jugadoresSlice = createSlice({
  name: "jugadores",
  initialState: {
    lista: [],
    cargando: false,
    error: null,
  },
  reducers: {
    actualizarJugadorLocal(state, action) {
      const idx = state.lista.findIndex((j) => j._id === action.payload._id);
      if (idx >= 0) state.lista[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(cargarJugadores.pending, (state) => {
        state.cargando = true;
      })
      .addCase(cargarJugadores.fulfilled, (state, action) => {
        state.cargando = false;
        state.lista = action.payload;
      })
      .addCase(cargarJugadores.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.error.message;
      })
      .addCase(crearJugadorThunk.fulfilled, (state, action) => {
        state.lista.push(action.payload);
      })
      .addCase(editarJugadorThunk.fulfilled, (state, action) => {
        const idx = state.lista.findIndex((j) => j._id === action.payload._id);
        if (idx >= 0) state.lista[idx] = action.payload;
      })
      .addCase(eliminarJugadorThunk.fulfilled, (state, action) => {
        state.lista = state.lista.filter((j) => j._id !== action.payload);
      });
  },
});

export const { actualizarJugadorLocal } = jugadoresSlice.actions;
export default jugadoresSlice.reducer;
