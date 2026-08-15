import { useEffect, useState } from "react";
import * as partidosApi from "../../api/partidos.api";
import { shortDate } from "../../utils/date";

export default function MatchPanel({ fecha, jugadores, campeonatos, puedeEliminar, onClose, onEliminado, onCambio }) {
  const [partido, setPartido] = useState(null);
  const [rival, setRival] = useState("");
  const [golesPropio, setGolesPropio] = useState("");
  const [golesRival, setGolesRival] = useState("");
  const [campeonatoId, setCampeonatoId] = useState("");
  const [citados, setCitados] = useState([]);
  const [minutos, setMinutos] = useState({});

  const cargar = async () => {
    const p = await partidosApi.obtenerPartido(fecha);
    setPartido(p);
    setRival(p.rival || "");
    setGolesPropio(p.golesPropio ?? "");
    setGolesRival(p.golesRival ?? "");
    setCampeonatoId(p.campeonato?._id || "");

    const citadosOriginal = (p.citados || []).map((j) => j._id || j);
    const citadosSinLesionados = citadosOriginal.filter((id) => {
      const jugador = jugadores.find((j) => j._id === id);
      return jugador ? !estaLesionado(jugador) : true;
    });
    setCitados(citadosSinLesionados);
    if (citadosSinLesionados.length !== citadosOriginal.length) {
      await partidosApi.setCitados(fecha, citadosSinLesionados);
    }

    const mins = {};
    (p.minutosJugados || []).forEach((m) => {
      mins[m.jugador._id || m.jugador] = m.minutos;
    });
    setMinutos(mins);
  };

  const estaLesionado = (jugador) => {
    return (jugador.lesiones || []).some((l) => fecha >= l.desde && fecha <= l.hasta);
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  const guardarResultado = async (campos) => {
    const actualizado = await partidosApi.editarPartido(fecha, campos);
    onCambio(actualizado);
  };

  const toggleCitado = async (jugadorId) => {
    const nuevos = citados.includes(jugadorId) ? citados.filter((id) => id !== jugadorId) : [...citados, jugadorId];
    setCitados(nuevos);
    const actualizado = await partidosApi.setCitados(fecha, nuevos);
    setCitados((actualizado.citados || []).map((j) => j._id || j));
    onCambio(actualizado);
  };

  const marcarNinguno = async () => {
    setCitados([]);
    const actualizado = await partidosApi.setCitados(fecha, []);
    onCambio(actualizado);
  };

  const marcarTodos = async () => {
    const disponibles = jugadores.filter((j) => !estaLesionado(j)).map((j) => j._id);
    setCitados(disponibles);
    const actualizado = await partidosApi.setCitados(fecha, disponibles);
    onCambio(actualizado);
  };

  const cambiarMinuto = async (jugadorId, valor) => {
    const nuevos = { ...minutos, [jugadorId]: valor === "" ? undefined : Number(valor) };
    setMinutos(nuevos);
    const limpio = Object.fromEntries(Object.entries(nuevos).filter(([, v]) => v !== undefined));
    const actualizado = await partidosApi.setMinutos(fecha, limpio);
    onCambio(actualizado);
  };

  const eliminar = async () => {
    if (!confirm("¿Eliminar este partido del calendario?")) return;
    await partidosApi.eliminarPartido(fecha);
    onEliminado(fecha);
  };

  if (!partido) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="detail-head">
          <span className="tag">Datos del partido · {shortDate(fecha)}</span>
          <button onClick={onClose}>×</button>
        </div>

        {puedeEliminar && (
          <button className="small-btn" style={{ color: "#a51b1b", borderColor: "#f3c9c9", marginBottom: 14 }} onClick={eliminar}>
            🗑️ Eliminar este partido
          </button>
        )}

        <div className="field-label" style={{ marginTop: 0 }}>
          Campeonato
        </div>
        <select
          value={campeonatoId}
          onChange={(e) => {
            setCampeonatoId(e.target.value);
            guardarResultado({ campeonato: e.target.value || null });
          }}
          style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}
        >
          <option value="">— Sin asignar —</option>
          {campeonatos.map((c) => (
            <option key={c._id} value={c._id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <div className="field-label">Rival y resultado</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Rival"
            value={rival}
            onChange={(e) => setRival(e.target.value)}
            onBlur={() => guardarResultado({ rival })}
            style={{ flex: 1, minWidth: 140, border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px" }}
          />
          <input
            type="number"
            placeholder="Goles propio"
            value={golesPropio}
            onChange={(e) => setGolesPropio(e.target.value)}
            onBlur={() => guardarResultado({ golesPropio: golesPropio === "" ? null : Number(golesPropio) })}
            style={{ width: 110, border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px" }}
          />
          <input
            type="number"
            placeholder="Goles rival"
            value={golesRival}
            onChange={(e) => setGolesRival(e.target.value)}
            onBlur={() => guardarResultado({ golesRival: golesRival === "" ? null : Number(golesRival) })}
            style={{ width: 110, border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px" }}
          />
        </div>

        <div className="field-label">Citados</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button className="small-btn" onClick={marcarTodos}>
            Todos
          </button>
          <button className="small-btn" onClick={marcarNinguno}>
            Ninguno
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 6, marginBottom: 14 }}>
          {jugadores.map((j) => {
            const lesionado = estaLesionado(j);
            return (
              <label
                key={j._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  padding: "5px 8px",
                  borderRadius: 8,
                  background: lesionado ? "#fdecea" : "#f7f7f5",
                }}
              >
                <input
                  type="checkbox"
                  checked={citados.includes(j._id)}
                  disabled={lesionado}
                  onChange={() => toggleCitado(j._id)}
                />
                <span>
                  {j.nombre}
                  {lesionado && <span style={{ display: "block", fontSize: 10, color: "#a51b1b" }}>Lesionado</span>}
                </span>
              </label>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: "#444", marginTop: 8, paddingTop: 8, borderTop: "1px dashed #eee" }}>
          <b>Citados ({citados.length}):</b>{" "}
          {jugadores.filter((j) => citados.includes(j._id)).map((j) => j.nombre).join(", ") || "—"}
          <br />
          <b>No citados ({jugadores.length - citados.length}):</b>{" "}
          {jugadores.filter((j) => !citados.includes(j._id)).map((j) => j.nombre).join(", ") || "—"}
        </div>

        <div className="field-label">Minutos jugados</div>
        <p className="note" style={{ marginTop: 0 }}>
          El que quede en 0 o en blanco se marca solo como "No ingresó".
        </p>
        {citados.length === 0 && <p className="note">Marcá primero los citados arriba.</p>}
        {citados.map((jid) => {
          const jugador = jugadores.find((j) => j._id === jid);
          if (!jugador) return null;
          const min = minutos[jid];
          const noIngreso = min === undefined || Number(min) === 0;
          return (
            <div key={jid} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, fontSize: 13 }}>
              <span style={{ flex: 1 }}>{jugador.nombre}</span>
              <input
                type="number"
                value={min ?? ""}
                onChange={(e) => cambiarMinuto(jid, e.target.value)}
                style={{ width: 90, border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px" }}
              />
              {noIngreso && (
                <span style={{ fontSize: 10, background: "#eee", color: "#888", padding: "2px 8px", borderRadius: 10 }}>No ingresó</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
