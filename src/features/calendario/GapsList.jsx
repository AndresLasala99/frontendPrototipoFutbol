import { shortDate, dateInMonth, addDaysISO } from "../../utils/date";

export default function GapsList({ gaps, viewDate, gapSeleccionado, onSeleccionar }) {
  const visibles = gaps.filter((g) => dateInMonth(g.fechaDesde, viewDate) || dateInMonth(g.fechaHasta, viewDate));

  if (gaps.length === 0) {
    return (
      <div className="panel">
        <p className="note">Marcá al menos dos partidos en el calendario para que se arme un microciclo.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3 className="panel-title">Microciclos</h3>
      {visibles.length === 0 && <p className="note">No hay microciclos que caigan en este mes.</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {visibles.map((g) => {
          const activo = gapSeleccionado && gapSeleccionado.fechaDesde === g.fechaDesde && gapSeleccionado.fechaHasta === g.fechaHasta;
          return (
            <button
              key={g.fechaDesde + g.fechaHasta}
              className="small-btn"
              style={activo ? { borderColor: "#222", background: "#efefec", fontWeight: 600 } : undefined}
              onClick={() => onSeleccionar(g)}
            >
              {shortDate(addDaysISO(g.fechaDesde, 1))} → {shortDate(g.fechaHasta)}
              <span style={{ display: "block", fontSize: 11, color: "#999" }}>{g.dias} días</span>
            </button>
          );
        })}
      </div>
      {gapSeleccionado && <p className="note">{gapSeleccionado.nota}</p>}
    </div>
  );
}
