function iniciales(nombre) {
  return (nombre || "?")
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function calcularDisponibilidadLocal(jugador, hoyISO) {
  const lesionActiva = (jugador.lesiones || []).find((l) => hoyISO >= l.desde && hoyISO <= l.hasta);
  if (lesionActiva) return { estado: "lesionado", icono: "✚", motivo: lesionActiva.texto || "Lesionado" };
  const cargaActiva = (jugador.cargasControladas || []).find((c) => hoyISO >= c.desde && hoyISO <= c.hasta);
  if (cargaActiva) return { estado: "carga_controlada", icono: "~", motivo: cargaActiva.motivo || "Carga controlada" };
  return { estado: "apto", icono: "✓", motivo: "" };
}

export default function PlayerCard({ jugador, onAbrir, onToggleLesion, onToggleCarga }) {
  const hoyISO = new Date().toISOString().slice(0, 10);
  const disponibilidad = calcularDisponibilidadLocal(jugador, hoyISO);
  const cargaActiva = (jugador.cargasControladas || []).find((c) => hoyISO >= c.desde && hoyISO <= c.hasta);

  return (
    <div className="player-card" onClick={() => onAbrir(jugador)}>
      <div
        className={`status-icon ${disponibilidad.estado}`}
        title={disponibilidad.motivo || "Apto"}
        style={onToggleLesion ? undefined : { cursor: "default" }}
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleLesion) onToggleLesion(jugador);
        }}
      >
        {disponibilidad.icono}
      </div>
      <div
        className="avatar"
        style={jugador.fotoUrl ? { backgroundImage: `url(${jugador.fotoUrl})` } : undefined}
      >
        {!jugador.fotoUrl && iniciales(jugador.nombre)}
      </div>
      <div className="pname">{jugador.nombre}</div>
      <div className="pposition">{jugador.posicion || ""}</div>
      {disponibilidad.estado !== "lesionado" && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleCarga) onToggleCarga(jugador);
          }}
          style={{
            marginTop: 6,
            fontSize: 10,
            padding: "3px 8px",
            borderRadius: 10,
            cursor: onToggleCarga ? "pointer" : "default",
            background: cargaActiva ? "#fff8e1" : "#f2f2ef",
            color: cargaActiva ? "#92610a" : "#999",
            fontWeight: cargaActiva ? 600 : 400,
          }}
          title={cargaActiva ? cargaActiva.motivo || "Carga controlada" : ""}
        >
          {cargaActiva ? "⚠ Carga controlada" : "+ Carga controlada"}
        </div>
      )}
    </div>
  );
}
