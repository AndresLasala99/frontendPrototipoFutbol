import { useEffect, useState } from "react";
import * as microciclosApi from "../../api/microciclos.api";
import * as gpsApi from "../../api/gps.api";
import * as uploadsApi from "../../api/uploads.api";
import * as sentidoApi from "../../api/sentido.api";
import * as partidosApi from "../../api/partidos.api";

async function partidoMasRecienteAntesDe(fecha) {
  const partidos = await partidosApi.listarPartidos();
  const anteriores = partidos.filter((p) => p.fecha <= fecha).sort((a, b) => b.fecha.localeCompare(a.fecha));
  return anteriores[0] || null;
}

async function jugadoresPorMinutos(fecha, jugadores, bajo45) {
  const partido = await partidoMasRecienteAntesDe(fecha);
  if (!partido) return null;
  const detalle = await partidosApi.obtenerPartido(partido.fecha);
  const minutosMap = {};
  (detalle.minutosJugados || []).forEach((m) => {
    minutosMap[m.jugador._id || m.jugador] = m.minutos;
  });
  return jugadores
    .filter((j) => disponibilidadLocal(j, fecha).estado !== "lesionado")
    .filter((j) => {
      const mins = minutosMap[j._id] ?? 0;
      return bajo45 ? mins < 45 : mins >= 45;
    })
    .map((j) => j._id);
}

function disponibilidadLocal(jugador, fecha) {
  const lesion = (jugador.lesiones || []).find((l) => fecha >= l.desde && fecha <= l.hasta);
  if (lesion) return { estado: "lesionado", motivo: lesion.texto || "Lesionado" };
  const carga = (jugador.cargasControladas || []).find((c) => fecha >= c.desde && fecha <= c.hasta);
  if (carga) return { estado: "carga_controlada", motivo: carga.motivo || "Carga controlada" };
  return { estado: "apto", motivo: "" };
}

function jugadoresAuto(jugadores, fecha) {
  return jugadores.filter((j) => disponibilidadLocal(j, fecha).estado !== "lesionado").map((j) => j._id);
}

function ResumenParticipantes({ jugadores, idsEfectivos }) {
  const participan = jugadores.filter((j) => idsEfectivos.includes(j._id));
  const noParticipan = jugadores.filter((j) => !idsEfectivos.includes(j._id));
  return (
    <div style={{ fontSize: 12, color: "#444", marginTop: 8, paddingTop: 8, borderTop: "1px dashed #eee" }}>
      <b>Participan ({participan.length}):</b> {participan.map((j) => j.nombre).join(", ") || "—"}
      <br />
      <b>No participan ({noParticipan.length}):</b> {noParticipan.map((j) => j.nombre).join(", ") || "—"}
    </div>
  );
}

export default function CellDetailPanel({ fechaDesde, fechaHasta, fecha, filaKey, filaLabel, jugadores, onClose, onGuardado }) {
  const [celda, setCelda] = useState(null);
  const [kmValores, setKmValores] = useState({});
  const [metrica, setMetrica] = useState("Distancia total (m)");
  const [sentidos, setSentidos] = useState({});
  const [diasMicrociclo, setDiasMicrociclo] = useState([]);
  const [verAcumulado, setVerAcumulado] = useState(false);
  const [acumulado, setAcumulado] = useState(null);
  const [subiendoPlanilla, setSubiendoPlanilla] = useState(false);
  const [borradorPlanilla, setBorradorPlanilla] = useState(null); // { metrica, filas: [{nombreDetectado, valor, jugadorId, jugadorNombre}] }

  const cargarAcumulado = async () => {
    const totales = {};
    for (const f of diasMicrociclo) {
      const registro = await gpsApi.obtenerRegistro(f);
      Object.entries(registro || {}).forEach(([jid, valor]) => {
        totales[jid] = (totales[jid] || 0) + Number(valor);
      });
    }
    setAcumulado(totales);
  };

  const cargarSentidos = async () => {
    const lista = await sentidoApi.listarPorFecha(fecha);
    const mapa = {};
    lista.forEach((s) => {
      mapa[s.jugador._id || s.jugador] = s.motivo;
    });
    setSentidos(mapa);
  };

  const toggleSentido = async (jugadorId) => {
    if (sentidos[jugadorId] !== undefined) {
      await sentidoApi.quitar(fecha, jugadorId);
    } else {
      const motivo = prompt('¿Por qué salió sentido? (opcional, ej. "molestia en gemelo")', "") || "";
      await sentidoApi.marcar(fecha, jugadorId, motivo);
    }
    cargarSentidos();
  };

  const cargar = async () => {
    const micro = await microciclosApi.obtenerMicrociclo(fechaDesde, fechaHasta);
    setDiasMicrociclo(micro.dias.map((d) => d.fecha));
    const dia = micro.dias.find((d) => d.fecha === fecha);
    setCelda(dia?.celdas[filaKey] || { nivel: 1, resumen: "", detalle: "", jugadores: null, dividido: false, grupos: [] });
    if (filaKey === "fisico") {
      const m = await gpsApi.obtenerMetrica();
      setMetrica(m);
      const registro = await gpsApi.obtenerRegistro(fecha);
      setKmValores(registro || {});
    }
  };

  useEffect(() => {
    cargar();
    cargarSentidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha, filaKey]);

  if (!celda) return null;

  const guardar = async (parcial) => {
    const actualizado = { ...celda, ...parcial };
    setCelda(actualizado);
    await microciclosApi.actualizarCelda(fechaDesde, fechaHasta, fecha, filaKey, parcial);
    onGuardado();
  };

  const listaEfectiva = celda.jugadores !== null && celda.jugadores !== undefined ? celda.jugadores : jugadoresAuto(jugadores, fecha);

  const toggleJugador = (id) => {
    const base = celda.jugadores !== null && celda.jugadores !== undefined ? [...celda.jugadores] : jugadoresAuto(jugadores, fecha);
    const nuevos = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    guardar({ jugadores: nuevos });
  };

  const guardarKm = async (jugadorId, valor) => {
    const nuevos = { ...kmValores, [jugadorId]: valor === "" ? undefined : Number(valor) };
    setKmValores(nuevos);
    const limpio = Object.fromEntries(Object.entries(nuevos).filter(([, v]) => v !== undefined));
    await gpsApi.guardarValores(fecha, limpio);
  };

  const subirPlanillaFisica = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoPlanilla(true);
    setBorradorPlanilla(null);
    try {
      const resultado = await gpsApi.extraerDesdeImagen(file);
      if (!resultado.filas || resultado.filas.length === 0) {
        alert("No pude leer ningún dato en esa imagen. Probá con una foto más clara, o cargalos a mano.");
      } else {
        setBorradorPlanilla(resultado);
      }
    } catch (error) {
      alert("No se pudo leer la imagen: " + (error.response?.data?.error || error.message));
    } finally {
      setSubiendoPlanilla(false);
      e.target.value = "";
    }
  };

  const editarFilaBorrador = (idx, campo, valor) => {
    setBorradorPlanilla((prev) => ({
      ...prev,
      filas: prev.filas.map((f, i) => (i === idx ? { ...f, [campo]: valor } : f)),
    }));
  };

  const confirmarBorradorPlanilla = async () => {
    const valores = {};
    borradorPlanilla.filas.forEach((f) => {
      if (f.jugadorId && f.valor !== "" && f.valor !== null && f.valor !== undefined) {
        valores[f.jugadorId] = Number(f.valor);
      }
    });
    if (Object.keys(valores).length === 0) {
      alert("No hay ninguna fila con jugador asignado y valor cargado.");
      return;
    }
    const nuevos = { ...kmValores, ...valores };
    setKmValores(nuevos);
    await gpsApi.guardarValores(fecha, valores);
    setBorradorPlanilla(null);
  };

  const subirImagenTactica = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { url } = await uploadsApi.subirImagen(file, "tactica");
    guardar({ imagenes: [...(celda.imagenes || []), url] });
  };

  const dividir = async () => {
    if (celda.dividido) {
      const g0 = celda.grupos?.[0] || { resumen: celda.resumen, detalle: celda.detalle, jugadores: celda.jugadores };
      guardar({ dividido: false, grupos: [], resumen: g0.resumen, detalle: g0.detalle, jugadores: g0.jugadores });
    } else {
      const partido = await partidoMasRecienteAntesDe(fecha);
      let grupo1 = celda.jugadores;
      let grupo2 = null;
      let etiqueta1 = "Jugaron";
      let etiqueta2 = "Pocos minutos y no citados";
      if (partido) {
        const detalle = await partidosApi.obtenerPartido(partido.fecha);
        const minutosMap = {};
        (detalle.minutosJugados || []).forEach((m) => {
          minutosMap[m.jugador._id || m.jugador] = m.minutos;
        });
        grupo1 = jugadores.filter((j) => (minutosMap[j._id] ?? 0) >= 45).map((j) => j._id);
        grupo2 = jugadores
          .filter((j) => (minutosMap[j._id] ?? 0) < 45 && disponibilidadLocal(j, fecha).estado !== "lesionado")
          .map((j) => j._id);
      }
      guardar({
        dividido: true,
        grupos: [
          { etiqueta: etiqueta1, resumen: celda.resumen || "", detalle: celda.detalle || "", jugadores: grupo1 },
          { etiqueta: etiqueta2, resumen: "", detalle: "", jugadores: grupo2 },
        ],
      });
    }
  };

  const editarGrupo = (idx, campo, valor) => {
    const grupos = celda.grupos.map((g, i) => (i === idx ? { ...g, [campo]: valor } : g));
    guardar({ grupos });
  };

  const toggleJugadorGrupo = (idx, jugadorId) => {
    const grupo = celda.grupos[idx];
    const base = grupo.jugadores !== null && grupo.jugadores !== undefined ? [...grupo.jugadores] : jugadoresAuto(jugadores, fecha);
    const nuevos = base.includes(jugadorId) ? base.filter((x) => x !== jugadorId) : [...base, jugadorId];
    editarGrupo(idx, "jugadores", nuevos);
  };

  const agregarGrupo = () => {
    guardar({ grupos: [...celda.grupos, { etiqueta: "Grupo " + (celda.grupos.length + 1), resumen: "", detalle: "", jugadores: null }] });
  };

  const eliminarGrupo = (idx) => {
    const grupos = celda.grupos.filter((_, i) => i !== idx);
    if (grupos.length <= 1) {
      const restante = grupos[0] || { resumen: "", detalle: "", jugadores: null };
      guardar({ dividido: false, grupos: [], ...restante });
    } else {
      guardar({ grupos });
    }
  };

  const isEmocional = filaKey === "emocional";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="detail-head">
          <span className="tag">
            {filaLabel} · {fecha}
          </span>
          <button onClick={onClose}>×</button>
        </div>

        {!isEmocional && (
          <button className="small-btn" onClick={dividir} style={{ marginBottom: 12 }}>
            {celda.dividido ? "Unificar en un solo plan" : "Dividir en 2 grupos"}
          </button>
        )}

        {!celda.dividido && (
          <>
            {!isEmocional && (
              <>
                <div className="field-label" style={{ marginTop: 0 }}>
                  Resumen
                </div>
                <input
                  type="text"
                  defaultValue={celda.resumen}
                  onBlur={(e) => guardar({ resumen: e.target.value })}
                  style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px" }}
                />
              </>
            )}
            <div className="field-label">{isEmocional ? "Comentarios" : "Detalle"}</div>
            <textarea defaultValue={celda.detalle} onBlur={(e) => guardar({ detalle: e.target.value })} />

            {filaKey === "fisico" && (
              <>
                <div className="field-label">Métrica GPS</div>
                <input
                  type="text"
                  defaultValue={metrica}
                  onBlur={async (e) => {
                    const nueva = e.target.value || "Distancia total (m)";
                    setMetrica(nueva);
                    await gpsApi.guardarMetrica(nueva);
                  }}
                  style={{ maxWidth: 260, border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}
                />
                <div className="field-label">Kilómetros por jugador ({metrica})</div>

                <div style={{ background: "#f4f7fb", border: "1px dashed #b8c8dc", borderRadius: 8, padding: 10, marginBottom: 12 }}>
                  <p className="note" style={{ marginTop: 0, marginBottom: 6 }}>
                    📷 Subí una foto de la planilla del entrenamiento y la IA intenta leer los valores de cada jugador solo.
                  </p>
                  <input type="file" accept="image/*" onChange={subirPlanillaFisica} disabled={subiendoPlanilla} />
                  {subiendoPlanilla && <p className="note">Leyendo la imagen…</p>}
                </div>

                {borradorPlanilla && (
                  <div style={{ background: "#fff8e1", border: "1px solid #f5deb3", borderRadius: 8, padding: 10, marginBottom: 12 }}>
                    <p className="note" style={{ marginTop: 0 }}>
                      Revisá antes de confirmar — corregí el jugador o el valor si hace falta.
                    </p>
                    {borradorPlanilla.filas.map((f, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, fontSize: 12 }}>
                        <span style={{ width: 110, color: f.jugadorId ? "#333" : "#a51b1b" }}>
                          "{f.nombreDetectado}"{!f.jugadorId && " ⚠"}
                        </span>
                        <select
                          value={f.jugadorId || ""}
                          onChange={(e) => {
                            const jug = jugadores.find((j) => j._id === e.target.value);
                            editarFilaBorrador(idx, "jugadorId", e.target.value || null);
                            editarFilaBorrador(idx, "jugadorNombre", jug ? jug.nombre : null);
                          }}
                          style={{ flex: 1, border: "1px solid #ddd", borderRadius: 6, padding: "4px 6px" }}
                        >
                          <option value="">— Sin asignar —</option>
                          {jugadores.map((j) => (
                            <option key={j._id} value={j._id}>
                              {j.nombre}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={f.valor}
                          onChange={(e) => editarFilaBorrador(idx, "valor", e.target.value)}
                          style={{ width: 80, border: "1px solid #ddd", borderRadius: 6, padding: "4px 6px" }}
                        />
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button className="small-btn" onClick={confirmarBorradorPlanilla} style={{ background: "#222", color: "#fff", borderColor: "#222" }}>
                        ✓ Confirmar y guardar
                      </button>
                      <button className="small-btn" onClick={() => setBorradorPlanilla(null)}>
                        Descartar
                      </button>
                    </div>
                  </div>
                )}

                {jugadores.map((j) => (
                  <div key={j._id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, fontSize: 13 }}>
                    <span style={{ flex: 1 }}>{j.nombre}</span>
                    <input
                      type="number"
                      defaultValue={kmValores[j._id] ?? ""}
                      onBlur={(e) => guardarKm(j._id, e.target.value)}
                      style={{ width: 90, border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                ))}

                <button
                  className="small-btn"
                  style={{ marginTop: 10 }}
                  onClick={async () => {
                    if (!verAcumulado) await cargarAcumulado();
                    setVerAcumulado(!verAcumulado);
                  }}
                >
                  {verAcumulado ? "▾" : "▸"} Métrica y acumulado del microciclo
                </button>
                {verAcumulado && acumulado && (
                  <div style={{ marginTop: 8 }}>
                    <div className="field-label" style={{ marginTop: 0 }}>
                      Acumulado del microciclo actual — {metrica}
                    </div>
                    {jugadores
                      .map((j) => ({ nombre: j.nombre, total: acumulado[j._id] || 0 }))
                      .sort((a, b) => b.total - a.total)
                      .map((r, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: "1px solid #f2f2ef" }}>
                          <span>{r.nombre}</span>
                          <span style={{ fontWeight: 600 }}>{r.total}</span>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}

            {filaKey === "tactica" && (
              <>
                <div className="field-label">Imágenes de los ejercicios</div>
                <input type="file" accept="image/*" onChange={subirImagenTactica} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {(celda.imagenes || []).map((src, idx) => (
                    <div key={idx} style={{ position: "relative", width: 90, height: 90 }}>
                      <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }} />
                      <button
                        onClick={() => guardar({ imagenes: celda.imagenes.filter((_, i) => i !== idx) })}
                        title="Eliminar"
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          background: "#a51b1b",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="field-label">Link de la grabación de la práctica</div>
                <input
                  type="text"
                  defaultValue={celda.linkPractica}
                  onBlur={(e) => guardar({ linkPractica: e.target.value })}
                  style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px" }}
                />
              </>
            )}

            {filaKey === "video" && (
              <>
                <div className="field-label">Link del video visto</div>
                <input
                  type="text"
                  defaultValue={celda.linkVideo}
                  onBlur={(e) => guardar({ linkVideo: e.target.value })}
                  style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px" }}
                />
              </>
            )}

            {!isEmocional && (
              <>
                <div className="field-label">Jugadores disponibles</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <button className="small-btn" onClick={() => guardar({ jugadores: jugadores.map((j) => j._id) })}>
                    Todos
                  </button>
                  <button className="small-btn" onClick={() => guardar({ jugadores: [] })}>
                    Ninguno
                  </button>
                  <button className="small-btn" onClick={() => guardar({ jugadores: null })}>
                    Automático
                  </button>
                  <button className="small-btn" onClick={() => guardar({ jugadores: jugadoresAuto(jugadores, fecha) })}>
                    Excepto Lesionados
                  </button>
                  <button
                    className="small-btn"
                    onClick={async () => {
                      const lista = await jugadoresPorMinutos(fecha, jugadores, true);
                      if (lista === null) alert("No encontré ningún partido anterior a esta fecha.");
                      else guardar({ jugadores: lista });
                    }}
                  >
                    Jugaron menos de 45'
                  </button>
                  <button
                    className="small-btn"
                    onClick={async () => {
                      const lista = await jugadoresPorMinutos(fecha, jugadores, false);
                      if (lista === null) alert("No encontré ningún partido anterior a esta fecha.");
                      else guardar({ jugadores: lista });
                    }}
                  >
                    Jugaron 45'+
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 6 }}>
                  {jugadores.map((j) => {
                    const disp = disponibilidadLocal(j, fecha);
                    const sentido = sentidos[j._id];
                    return (
                      <div
                        key={j._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 13,
                          padding: "5px 8px",
                          borderRadius: 8,
                          background: disp.estado === "lesionado" ? "#fdecea" : disp.estado === "carga_controlada" ? "#fff8e1" : "#f7f7f5",
                        }}
                      >
                        <input type="checkbox" checked={listaEfectiva.includes(j._id)} onChange={() => toggleJugador(j._id)} />
                        <span style={{ flex: 1 }}>
                          {j.nombre}
                          {disp.motivo && <span style={{ display: "block", fontSize: 10, color: "#a51b1b" }}>{disp.motivo}</span>}
                          {sentido !== undefined && (
                            <span style={{ display: "block", fontSize: 10, color: "#2f5fa8" }}>
                              🩹 Salió sentido{sentido ? ": " + sentido : ""}
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleSentido(j._id)}
                          title="Marcar/quitar que salió sentido este día"
                          style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, opacity: sentido !== undefined ? 1 : 0.5 }}
                        >
                          {sentido !== undefined ? "🩹✓" : "🩹"}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <ResumenParticipantes jugadores={jugadores} idsEfectivos={listaEfectiva} />
              </>
            )}
          </>
        )}

        {celda.dividido &&
          celda.grupos.map((g, idx) => {
            const efectivo = g.jugadores !== null && g.jugadores !== undefined ? g.jugadores : jugadoresAuto(jugadores, fecha);
            return (
              <div key={idx} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <input
                    type="text"
                    defaultValue={g.etiqueta}
                    onBlur={(e) => editarGrupo(idx, "etiqueta", e.target.value)}
                    style={{ flex: 1, fontWeight: 600, border: "none", borderBottom: "1px dashed transparent", background: "transparent" }}
                  />
                  <button className="rm-btn" onClick={() => eliminarGrupo(idx)}>
                    ×
                  </button>
                </div>
                <div className="field-label" style={{ marginTop: 0 }}>
                  Resumen
                </div>
                <input
                  type="text"
                  defaultValue={g.resumen}
                  onBlur={(e) => editarGrupo(idx, "resumen", e.target.value)}
                  style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px" }}
                />
                <div className="field-label">Detalle</div>
                <textarea defaultValue={g.detalle} onBlur={(e) => editarGrupo(idx, "detalle", e.target.value)} />
                <div className="field-label">Jugadores de este grupo</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <button className="small-btn" onClick={() => editarGrupo(idx, "jugadores", jugadores.map((j) => j._id))}>
                    Todos
                  </button>
                  <button className="small-btn" onClick={() => editarGrupo(idx, "jugadores", [])}>
                    Ninguno
                  </button>
                  <button className="small-btn" onClick={() => editarGrupo(idx, "jugadores", jugadoresAuto(jugadores, fecha))}>
                    Excepto Lesionados
                  </button>
                  <button
                    className="small-btn"
                    onClick={async () => {
                      const lista = await jugadoresPorMinutos(fecha, jugadores, true);
                      if (lista !== null) editarGrupo(idx, "jugadores", lista);
                    }}
                  >
                    Jugaron menos de 45'
                  </button>
                  <button
                    className="small-btn"
                    onClick={async () => {
                      const lista = await jugadoresPorMinutos(fecha, jugadores, false);
                      if (lista !== null) editarGrupo(idx, "jugadores", lista);
                    }}
                  >
                    Jugaron 45'+
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 6 }}>
                  {jugadores.map((j) => {
                    const disp = disponibilidadLocal(j, fecha);
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
                          background: disp.estado === "lesionado" ? "#fdecea" : disp.estado === "carga_controlada" ? "#fff8e1" : "#f7f7f5",
                        }}
                      >
                        <input type="checkbox" checked={efectivo.includes(j._id)} onChange={() => toggleJugadorGrupo(idx, j._id)} />
                        <span>
                          {j.nombre}
                          {disp.motivo && <span style={{ display: "block", fontSize: 10, color: "#a51b1b" }}>{disp.motivo}</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <ResumenParticipantes jugadores={jugadores} idsEfectivos={efectivo} />
              </div>
            );
          })}
        {celda.dividido && (
          <button className="small-btn" onClick={agregarGrupo}>
            + Agregar subgrupo
          </button>
        )}
      </div>
    </div>
  );
}
