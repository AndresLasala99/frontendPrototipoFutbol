import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.slice";
import jugadoresReducer from "./jugadores.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jugadores: jugadoresReducer,
  },
});
