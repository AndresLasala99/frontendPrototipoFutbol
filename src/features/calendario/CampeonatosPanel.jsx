import { useEffect, useState } from "react";
import * as campeonatosApi from "../../api/campeonatos.api";

const PALETA = ["#4285f4", "#e91e63", "#009688", "#ff9800", "#9c27b0", "#795548", "#607d8b", "#3f51b5", "#c62828", "#2e7d32"];

export function colorCampeonato(campeonatos, id) {
  const idx = campeonatos.findIndex((c) => c._id === id);
  return PALETA[(idx >= 0 ? idx : 0) % PALETA.length];
}

export default function CampeonatosPanel({ campeonatos, onCambio, puedeEliminar, puedeGuardar = true }) {
  const cargar = async () => onCambio(await campeonatosApi.listarCampeonatos());

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const agregar = async () => {
    const nombre = prompt("Nombre del campeonato (ej. Copa Uruguay):");
    if (!nombre) return;
    await campeonatosApi.crearCampeonato(nombre);
    cargar();
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este campeonato? Se pierden las estadísticas asociadas de los jugadores.")) return;
    await campeonatosApi.eliminarCampeonato(id);
    cargar();
  };

  const guardarNombre = async (id, nombreActual, nombreNuevo) => {
    if (!nombreNuevo.trim() || nombreNuevo === nombreActual) return;
    await campeonatosApi.renombrarCampeonato(id, nombreNuevo.trim());
    cargar();
  };

  return (
    <div className="panel">
      <h3 className="panel-title">Campeonatos de la temporada</h3>
      <p className="note">Editá el nombre tocándolo, o agregá/sacá campeonatos.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {campeonatos.map((c) => (
          <div key={c._id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              style={{ width: 10, height: 10, borderRadius: 3, background: colorCampeonato(campeonatos, c._id), display: "inline-block" }}
            />
            <input
              type="text"
              defaultValue={c.nombre}
              disabled={!puedeGuardar}
              onBlur={(e) => guardarNombre(c._id, c.nombre, e.target.value)}
              style={{ flex: 1, border: "1px solid #ddd", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontFamily: "inherit" }}
            />
            {puedeEliminar && (
              <button className="rm-btn" onClick={() => eliminar(c._id)}>
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {puedeGuardar && (
        <button className="small-btn" onClick={agregar}>
          + Agregar campeonato
        </button>
      )}
    </div>
  );
}
