import { useState, useEffect } from "react";
import * as jugadoresApi from "../../api/jugadores.api";
import * as gpsApi from "../../api/gps.api";
import * as microciclosApi from "../../api/microciclos.api";
import * as partidosApi from "../../api/partidos.api";
import { addDaysISO, parseISO } from "../../utils/date";

function diffDiasLocal(fechaA, fechaB) {
  return Math.round((parseISO(fechaB) - parseISO(fechaA)) / 86400000);
}

// Calcula la etiqueta relativa (MD, MD+1, MD-2, etc.) de una fecha de entrenamiento
// según los partidos que la rodean, sea cual sea el mes.
function etiquetaRelativa(fecha, fechasPartidos) {
  if (fechasPartidos.includes(fecha)) return "MD";
  const anteriores = fechasPartidos.filter((f) => f < fecha).sort();
  const siguientes = fechasPartidos.filter((f) => f > fecha).sort();
  const anterior = anteriores[anteriores.length - 1];
  const siguiente = siguientes[0];
  if (anterior && fecha === addDaysISO(anterior, 1)) return "MD+1";
  if (siguiente) return "MD-" + diffDiasLocal(fecha, siguiente);
  if (anterior) return "MD+" + diffDiasLocal(anterior, fecha);
  return "";
}

function estadoLesion(l) {
  const hoy = new Date().toISOString().slice(0, 10);
  if (!l.desde || !l.hasta) return { label: "Sin fechas", color: "#888", bg: "#eee" };
  if (hoy < l.desde) return { label: "Futura", color: "#92610a", bg: "#fff8e1" };
  if (hoy > l.hasta) return { label: "Finalizada", color: "#888", bg: "#eee" };
  return { label: "Activa", color: "#a51b1b", bg: "#fdecea" };
}

function NuevoPartidoManual({ onAgregar }) {
  const [rival, setRival] = useState("");
  const [fecha, setFecha] = useState("");
  const [minutos, setMinutos] = useState("");

  const agregar = async () => {
    if (!fecha) {
      alert("Poné al menos la fecha del partido.");
      return;
    }
    await onAgregar({ fecha, rival, minutos: minutos === "" ? 0 : Number(minutos) });
    setRival("");
    setFecha("");
    setMinutos("");
  };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, paddingTop: 8, borderTop: "1px dashed #ddd" }}>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", fontSize: 12 }} />
      <input
        type="text"
        placeholder="Rival"
        value={rival}
        onChange={(e) => setRival(e.target.value)}
        style={{ flex: 1, minWidth: 100, border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}
      />
      <input
        type="number"
        placeholder="Minutos"
        value={minutos}
        onChange={(e) => setMinutos(e.target.value)}
        style={{ width: 80, border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}
      />
      <button className="small-btn" onClick={agregar}>
        + Agregar partido
      </button>
    </div>
  );
}

function NuevoCampeonatoManual({ onAgregar }) {
  const [mostrar, setMostrar] = useState(false);
  const [campeonato, setCampeonato] = useState("");
  const [rival, setRival] = useState("");
  const [fecha, setFecha] = useState("");
  const [minutos, setMinutos] = useState("");

  if (!mostrar) {
    return (
      <button className="small-btn" onClick={() => setMostrar(true)}>
        + Cargar partido de otro campeonato
      </button>
    );
  }

  const agregar = async () => {
    if (!campeonato.trim() || !fecha) {
      alert("Poné al menos el campeonato y la fecha.");
      return;
    }
    await onAgregar({ campeonato: campeonato.trim(), fecha, rival, minutos: minutos === "" ? 0 : Number(minutos) });
    setCampeonato("");
    setRival("");
    setFecha("");
    setMinutos("");
    setMostrar(false);
  };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", background: "#f9f9f7", borderRadius: 8, padding: 10 }}>
      <input
        type="text"
        placeholder="Campeonato"
        value={campeonato}
        onChange={(e) => setCampeonato(e.target.value)}
        style={{ minWidth: 100, border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}
      />
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", fontSize: 12 }} />
      <input
        type="text"
        placeholder="Rival"
        value={rival}
        onChange={(e) => setRival(e.target.value)}
        style={{ flex: 1, minWidth: 100, border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}
      />
      <input
        type="number"
        placeholder="Minutos"
        value={minutos}
        onChange={(e) => setMinutos(e.target.value)}
        style={{ width: 80, border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", fontSize: 12 }}
      />
      <button className="small-btn" onClick={agregar}>
        Guardar
      </button>
    </div>
  );
}

export default function PlayerProfileModal({ jugador, campeonatos, puedeEliminar, puedeGuardar = true, onEliminar, onClose, onActualizado }) {
  const [form, setForm] = useState(jugador);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [nuevaLesion, setNuevaLesion] = useState({ texto: "", desde: "", hasta: "" });
  const [gpsHistorial, setGpsHistorial] = useState([]);
  const [gpsMetrica, setGpsMetrica] = useState("");
  const [verHistorialGps, setVerHistorialGps] = useState(false);
  const [campeonatoAbierto, setCampeonatoAbierto] = useState(null);
  const [microcicloActualTotal, setMicrocicloActualTotal] = useState(null);
  const [fechasPartidos, setFechasPartidos] = useState([]);
  const [rangoDesde, setRangoDesde] = useState("");
  const [rangoHasta, setRangoHasta] = useState("");

  useEffect(() => {
    setForm(jugador);
    gpsApi.historialJugador(jugador._id).then(setGpsHistorial);
    gpsApi.obtenerMetrica().then(setGpsMetrica);
    partidosApi.listarPartidos().then((partidos) => setFechasPartidos(partidos.map((p) => p.fecha)));
    microciclosApi.listarGaps().then((gaps) => {
      const hoy = new Date().toISOString().slice(0, 10);
      const gapVigente = gaps.find((g) => hoy >= g.fechaDesde && hoy <= g.fechaHasta) || gaps[gaps.length - 1];
      if (!gapVigente) {
        setMicrocicloActualTotal(null);
        return;
      }
      gpsApi.acumulado(gapVigente.fechaDesde, gapVigente.fechaHasta).then((totales) => {
        setMicrocicloActualTotal(totales[jugador._id] || 0);
      });
    });
  }, [jugador]);

  if (!jugador) return null;

  const guardarCampo = async (campo, valor) => {
    setForm({ ...form, [campo]: valor });
    const actualizado = await jugadoresApi.editarJugador(jugador._id, { [campo]: valor });
    onActualizado(actualizado);
  };

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoFoto(true);
    try {
      const { url } = await jugadoresApi.subirFoto(file);
      await guardarCampo("fotoUrl", url);
    } finally {
      setSubiendoFoto(false);
    }
  };

  const agregarLesion = async () => {
    if (!nuevaLesion.desde) {
      alert("Completá al menos la fecha desde de la lesión.");
      return;
    }
    const hasta = nuevaLesion.hasta || addDaysISO(nuevaLesion.desde, 7);
    try {
      const actualizado = await jugadoresApi.agregarLesion(jugador._id, { ...nuevaLesion, hasta });
      onActualizado(actualizado);
      setForm(actualizado);
      setNuevaLesion({ texto: "", desde: "", hasta: "" });
    } catch (error) {
      alert("No se pudo guardar la lesión: " + (error.response?.data?.error || error.message));
    }
  };

  const eliminarLesion = async (lesionId) => {
    const actualizado = await jugadoresApi.eliminarLesion(jugador._id, lesionId);
    onActualizado(actualizado);
    setForm(actualizado);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="detail-head">
          <span className="tag">{form.nombre || "Jugador"}</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {puedeEliminar && (
              <button
                className="small-btn"
                style={{ color: "#a51b1b", borderColor: "#f3c9c9" }}
                onClick={() => onEliminar(jugador)}
              >
                🗑️ Eliminar jugador
              </button>
            )}
            <button className="small-btn" style={{ background: "#222", color: "#fff", borderColor: "#222" }} onClick={onClose}>
              ✓ Listo
            </button>
            <button onClick={onClose}>×</button>
          </div>
        </div>

        <div className="profile-photo-row">
          <div className="avatar" style={form.fotoUrl ? { backgroundImage: `url(${form.fotoUrl})` } : undefined}>
            {!form.fotoUrl && "?"}
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handleFoto} disabled={subiendoFoto || !puedeGuardar} />
            <p className="note">{subiendoFoto ? "Subiendo..." : "Se sube a Cloudinary."}</p>
          </div>
        </div>

        <div className="field-label">Datos</div>
        <div className="profile-grid">
          <div>
            <label>Nombre</label>
            <input
              defaultValue={form.nombre}
              autoFocus={puedeGuardar}
              disabled={!puedeGuardar}
              onFocus={(e) => e.target.select()}
              onBlur={(e) => guardarCampo("nombre", e.target.value)}
            />
          </div>
          <div>
            <label>Posición</label>
            <input defaultValue={form.posicion} disabled={!puedeGuardar} onBlur={(e) => guardarCampo("posicion", e.target.value)} />
          </div>
          <div>
            <label>Altura (cm)</label>
            <input
              type="number"
              defaultValue={form.altura}
              disabled={!puedeGuardar}
              onBlur={(e) => guardarCampo("altura", Number(e.target.value))}
            />
          </div>
          <div>
            <label>Peso (kg)</label>
            <input
              type="number"
              defaultValue={form.peso}
              disabled={!puedeGuardar}
              onBlur={(e) => guardarCampo("peso", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="field-label">Partidos y minutos por campeonato</div>
        {(() => {
          const nombresCampeonatos = (campeonatos || []).map((c) => c.nombre);
          const nombresConDatos = (form.estadisticas || []).map((e) => e.campeonato);
          const todosLosNombres = [...new Set([...nombresCampeonatos, ...nombresConDatos])];
          const filas = todosLosNombres.map(
            (nombre) => (form.estadisticas || []).find((e) => e.campeonato === nombre) || { campeonato: nombre, partidos: [] }
          );
          if (filas.length === 0) return <p className="note" style={{ marginTop: 0 }}>Todavía no hay campeonatos cargados.</p>;
          return filas.map((est) => {
          const totalPartidos = est.partidos.length;
          const totalMinutos = est.partidos.reduce((s, p) => s + (p.minutos || 0), 0);
          const abierto = campeonatoAbierto === est.campeonato;
          return (
            <div key={est.campeonato} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ flex: 1 }}>{est.campeonato}</span>
                <span>{totalPartidos} partidos</span>
                <span>{totalMinutos}'</span>
                <button className="small-btn" onClick={() => setCampeonatoAbierto(abierto ? null : est.campeonato)}>
                  {abierto ? "▾" : "▸"} Por rival
                </button>
              </div>
              {abierto && (
                <div style={{ marginTop: 6, background: "#f9f9f7", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ display: "flex", gap: 6, fontSize: 10, color: "#999", textTransform: "uppercase", padding: "0 0 4px" }}>
                    <span style={{ width: 90 }}>Fecha</span>
                    <span style={{ flex: 1 }}>Rival</span>
                    <span style={{ width: 60 }}>Min.</span>
                    <span style={{ width: 150 }}>Motivo (si 0 min)</span>
                    <span style={{ width: 20 }} />
                  </div>
                  {est.partidos.map((p, i) => {
                    const actualizarEntrada = async (campos) => {
                      const actualizado = await jugadoresApi.agregarEstadisticaPartido(jugador._id, {
                        campeonato: est.campeonato,
                        fecha: p.fecha,
                        rival: p.rival,
                        minutos: p.minutos,
                        motivo: p.motivo,
                        ...campos,
                      });
                      onActualizado(actualizado);
                      setForm(actualizado);
                    };
                    const noJugo = p.minutos === undefined || p.minutos === "" || Number(p.minutos) === 0;
                    return (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, padding: "3px 0" }}>
                        <span style={{ width: 90 }}>{p.fecha}</span>
                        <input
                          type="text"
                          defaultValue={p.rival}
                          placeholder="Rival"
                          disabled={!puedeGuardar}
                          onBlur={(e) => actualizarEntrada({ rival: e.target.value })}
                          style={{ flex: 1, border: "1px solid #ddd", borderRadius: 6, padding: "4px 6px" }}
                        />
                        <input
                          type="number"
                          defaultValue={p.minutos}
                          disabled={!puedeGuardar}
                          onBlur={(e) => {
                            const minutos = e.target.value === "" ? 0 : Number(e.target.value);
                            actualizarEntrada({ minutos, motivo: minutos > 0 ? "" : p.motivo || "No ingresó" });
                          }}
                          style={{ width: 60, border: "1px solid #ddd", borderRadius: 6, padding: "4px 6px" }}
                        />
                        <span style={{ width: 150, display: "flex", gap: 4, alignItems: "center" }}>
                          {noJugo ? (
                            <select
                              value={["", "No citado", "Lesionado", "Otro"].includes(p.motivo) ? p.motivo : p.motivo ? "Otro" : ""}
                              disabled={!puedeGuardar}
                              onChange={(e) => actualizarEntrada({ motivo: e.target.value })}
                              style={{ border: "1px solid #ddd", borderRadius: 6, padding: "4px 4px", fontSize: 11 }}
                            >
                              <option value="">—</option>
                              <option value="No citado">No citado</option>
                              <option value="Lesionado">Lesionado</option>
                              <option value="Otro">Otro</option>
                            </select>
                          ) : (
                            <span style={{ color: "#ccc" }}>—</span>
                          )}
                        </span>
                        {puedeGuardar && (
                          <button
                            className="rm-btn"
                            onClick={async () => {
                              const actualizado = await jugadoresApi.eliminarEstadisticaPartido(jugador._id, est.campeonato, p.fecha);
                              onActualizado(actualizado);
                              setForm(actualizado);
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {puedeGuardar && (
                    <NuevoPartidoManual
                      campeonato={est.campeonato}
                      onAgregar={async (datos) => {
                        const actualizado = await jugadoresApi.agregarEstadisticaPartido(jugador._id, { campeonato: est.campeonato, ...datos });
                        onActualizado(actualizado);
                        setForm(actualizado);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
          });
        })()}
        {(form.estadisticas || []).length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 600, borderTop: "1px solid #eee", paddingTop: 8, marginTop: 4 }}>
            <span style={{ flex: 1 }}>TODOS</span>
            <span>{(form.estadisticas || []).reduce((s, e) => s + e.partidos.length, 0)} partidos</span>
            <span>{(form.estadisticas || []).reduce((s, e) => s + e.partidos.reduce((s2, p) => s2 + (p.minutos || 0), 0), 0)}'</span>
          </div>
        )}
        <div style={{ marginTop: 10 }}>
          {puedeGuardar && (
            <NuevoCampeonatoManual
              onAgregar={async (datos) => {
                const actualizado = await jugadoresApi.agregarEstadisticaPartido(jugador._id, datos);
                onActualizado(actualizado);
                setForm(actualizado);
              }}
            />
          )}
        </div>

        <div className="field-label">Carga GPS individual</div>
        {(() => {
          const totalEntreno = gpsHistorial.filter((h) => !h.esPartido).reduce((s, h) => s + h.valor, 0);
          const totalPartido = gpsHistorial.filter((h) => h.esPartido).reduce((s, h) => s + h.valor, 0);
          const historialFiltrado = gpsHistorial.filter((h) => {
            if (rangoDesde && h.fecha < rangoDesde) return false;
            if (rangoHasta && h.fecha > rangoHasta) return false;
            return true;
          });
          return (
            <>
              <p className="note" style={{ marginTop: 0 }}>Métrica: {gpsMetrica}</p>
              <div style={{ display: "flex", gap: 24, fontSize: 13, marginBottom: 10, flexWrap: "wrap" }}>
                {microcicloActualTotal !== null && (
                  <div>
                    <b>{microcicloActualTotal}</b>
                    <br />
                    <span style={{ color: "#999", fontSize: 11 }}>Microciclo actual</span>
                  </div>
                )}
                <div>
                  <b>{totalEntreno}</b>
                  <br />
                  <span style={{ color: "#999", fontSize: 11 }}>Entrenamientos</span>
                </div>
                <div>
                  <b>{totalPartido}</b>
                  <br />
                  <span style={{ color: "#999", fontSize: 11 }}>Partidos</span>
                </div>
              </div>
              {gpsHistorial.length === 0 ? (
                <p className="note" style={{ marginTop: 0 }}>Sin registros todavía.</p>
              ) : (
                <>
                  <button className="small-btn" onClick={() => setVerHistorialGps(!verHistorialGps)}>
                    {verHistorialGps ? "▾" : "▸"} Ver historial completo ({gpsHistorial.length} registros)
                  </button>
                  {verHistorialGps && (
                    <>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap", fontSize: 12 }}>
                        <span style={{ color: "#999" }}>Ver de</span>
                        <input type="date" value={rangoDesde} onChange={(e) => setRangoDesde(e.target.value)} style={{ border: "1px solid #ddd", borderRadius: 6, padding: "4px 6px" }} />
                        <span style={{ color: "#999" }}>a</span>
                        <input type="date" value={rangoHasta} onChange={(e) => setRangoHasta(e.target.value)} style={{ border: "1px solid #ddd", borderRadius: 6, padding: "4px 6px" }} />
                        {(rangoDesde || rangoHasta) && (
                          <button className="rm-btn" onClick={() => { setRangoDesde(""); setRangoHasta(""); }}>
                            Sacar filtro
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: 220, overflowY: "auto", fontSize: 12, borderTop: "1px solid #f2f2ef", marginTop: 8 }}>
                        {historialFiltrado.length === 0 && <p className="note">Sin registros en ese rango.</p>}
                        {historialFiltrado
                          .slice()
                          .reverse()
                          .map((h, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f2f2ef" }}>
                              <span>
                                {h.fecha}{" "}
                                <span style={{ color: "#999" }}>({etiquetaRelativa(h.fecha, fechasPartidos) || "—"})</span>{" "}
                                {h.esPartido ? "⚽ Partido" : "🏃 Entrenamiento"}
                              </span>
                              <span>
                                <b>{h.valor}</b>
                              </span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          );
        })()}

        <div className="field-label">Observaciones / Mejoras</div>
        <textarea
          defaultValue={form.notas}
          placeholder="Aspectos a mejorar, comentarios generales..."
          disabled={!puedeGuardar}
          onBlur={(e) => guardarCampo("notas", e.target.value)}
        />

        <div className="field-label">Historial de lesiones</div>
        <div className="injury-list">
          {(form.lesiones || []).length === 0 && <p className="note">Sin lesiones registradas.</p>}
          {(form.lesiones || []).map((l) => {
            const estado = estadoLesion(l);
            return (
              <div className="injury-row" key={l._id}>
                <span style={{ flex: 1 }}>{l.texto || "sin detalle"}</span>
                <span>
                  {l.desde} a {l.hasta}
                </span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: estado.bg, color: estado.color }}>
                  {estado.label}
                </span>
                {puedeGuardar && (
                  <button className="rm-btn" onClick={() => eliminarLesion(l._id)}>
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {puedeGuardar && (
          <>
            <div className="injury-row">
              <input
                type="text"
                placeholder="Lesión (ej. esguince tobillo)"
                value={nuevaLesion.texto}
                onChange={(e) => setNuevaLesion({ ...nuevaLesion, texto: e.target.value })}
              />
              <input
                type="date"
                value={nuevaLesion.desde}
                onChange={(e) => setNuevaLesion({ ...nuevaLesion, desde: e.target.value })}
              />
              <span>a</span>
              <input
                type="date"
                title="Opcional: si no la sabés, se calcula una fecha estimada de 7 días"
                value={nuevaLesion.hasta}
                onChange={(e) => setNuevaLesion({ ...nuevaLesion, hasta: e.target.value })}
              />
              <button
                className="small-btn"
                onClick={agregarLesion}
                style={{ background: "#a51b1b", color: "#fff", borderColor: "#a51b1b" }}
              >
                + Agregar
              </button>
            </div>
            <p className="note" style={{ marginTop: 4 }}>
              Si no sabés la fecha de vuelta todavía, dejá "hasta" en blanco — se estima 7 días y después la podés ajustar.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
