import { toISO, shortDate, dateInMonth } from "../../utils/date";
import { colorCampeonato } from "./CampeonatosPanel";

export default function MonthCalendar({ viewDate, setViewDate, partidos, campeonatos, onDiaClick, puedeEliminar, onEliminarPartido, gapSeleccionado }) {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const primerDia = new Date(y, m, 1);
  let offset = primerDia.getDay() - 1;
  if (offset < 0) offset = 6;
  const diasEnMes = new Date(y, m + 1, 0).getDate();
  const hoyISO = toISO(new Date());

  const partidoPorFecha = Object.fromEntries(partidos.map((p) => [p.fecha, p]));

  const celdas = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let dia = 1; dia <= diasEnMes; dia++) {
    celdas.push(toISO(new Date(Date.UTC(y, m, dia))));
  }

  return (
    <div className="panel" id="cal-panel">
      <h3 className="panel-title">Partidos</h3>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="small-btn" onClick={() => setViewDate(new Date(y, m - 1, 1))}>
            ‹
          </button>
          <button className="small-btn" onClick={() => setViewDate(new Date())}>
            Hoy
          </button>
          <button className="small-btn" onClick={() => setViewDate(new Date(y, m + 1, 1))}>
            ›
          </button>
        </div>
        <div style={{ fontWeight: 600, textTransform: "capitalize" }}>
          {new Intl.DateTimeFormat("es-UY", { month: "long", year: "numeric" }).format(viewDate)}
        </div>
        <div />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, maxWidth: 420 }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} style={{ fontSize: 11, color: "#999", textAlign: "center", textTransform: "uppercase" }}>
            {d}
          </div>
        ))}
        {celdas.map((fecha, i) => {
          if (!fecha) return <div key={i} style={{ aspectRatio: 1 }} />;
          const partido = partidoPorFecha[fecha];
          const color = partido && partido.campeonato ? colorCampeonato(campeonatos, partido.campeonato._id || partido.campeonato) : "#222";
          const enMicrocicloSeleccionado =
            !partido &&
            gapSeleccionado &&
            fecha > gapSeleccionado.fechaDesde &&
            fecha < gapSeleccionado.fechaHasta;
          return (
            <div
              key={i}
              onClick={() => onDiaClick(fecha, !!partido)}
              style={{
                aspectRatio: 1,
                borderRadius: 8,
                border: fecha === hoyISO ? "1.5px solid #999" : "1px solid #eee",
                background: partido ? color : enMicrocicloSeleccionado ? "#e5e5e2" : "#fafafa",
                color: partido ? "#fff" : "#444",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                cursor: "pointer",
                overflow: "hidden",
                padding: 2,
              }}
            >
              {partido?.rival && (
                <span style={{ fontSize: 8, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                  {partido.rival}
                </span>
              )}
              <span>{fecha.slice(-2)}</span>
            </div>
          );
        })}
      </div>
      <p className="note">Tocá un día vacío para marcarlo como partido. Tocá un partido ya marcado para ver/cargar sus datos.</p>

      {campeonatos.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10 }}>
          {campeonatos.map((c) => (
            <span key={c._id} className="note" style={{ margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: colorCampeonato(campeonatos, c._id), display: "inline-block" }} />
              {c.nombre}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {partidos
          .filter((p) => dateInMonth(p.fecha, viewDate))
          .map((p) => (
            <span
              key={p.fecha}
              className="note"
              style={{ background: "#f2f2ef", borderRadius: 20, padding: "5px 12px", margin: 0, display: "flex", alignItems: "center", gap: 6 }}
            >
              {shortDate(p.fecha)}
              {p.campeonato ? " · " + (p.campeonato.nombre || "") : ""}
              {puedeEliminar && (
                <button
                  className="rm-btn"
                  title="Quitar"
                  onClick={() => {
                    if (confirm("¿Sacar este partido del calendario?")) onEliminarPartido(p.fecha);
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
      </div>
    </div>
  );
}
