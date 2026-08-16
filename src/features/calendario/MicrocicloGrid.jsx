import { shortDate } from "../../utils/date";
import { Fragment } from "react";

const NIVEL_COLOR = { 1: { bg: "#eaf7ec", border: "#34a853", text: "#1e7e34" }, 2: { bg: "#fff8e1", border: "#f5a623", text: "#92610a" }, 3: { bg: "#fdecea", border: "#e53e3e", text: "#a51b1b" } };

export default function MicrocicloGrid({ microciclo, onEditarEtiqueta, onAbrirCelda, onCambiarNivel, onAgregarFila, onEliminarFila, onRestablecer, puedeEliminar, puedeGuardar = true }) {
  if (!microciclo) return null;
  const { filas, dias } = microciclo;

  return (
    <div className="panel">
      <div style={{ overflowX: "auto" }} id="microciclo-grid-print">
        <div style={{ display: "grid", gridTemplateColumns: `120px repeat(${dias.length}, minmax(120px,1fr))`, gap: 6, minWidth: 700 }}>
          <div />
          {dias.map((d) => (
            <div key={d.fecha} style={{ textAlign: "center", fontSize: 13, fontWeight: 600 }}>
              <span
                contentEditable={puedeGuardar}
                suppressContentEditableWarning
                onBlur={(e) => puedeGuardar && onEditarEtiqueta(d.fecha, e.target.textContent)}
                style={{ display: "block", outline: "none" }}
              >
                {d.etiqueta}
              </span>
              <span style={{ fontSize: 11, color: "#999", textTransform: "capitalize" }}>{shortDate(d.fecha)}</span>
            </div>
          ))}

          {filas.map((fila) => (
            <Fragment key={fila.key}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#444" }}>
                {puedeEliminar && (
                  <button className="rm-btn" onClick={() => onEliminarFila(fila.key)} title="Eliminar fila">
                    ×
                  </button>
                )}
                {fila.label}
              </div>
              {dias.map((d) => {
                const celda = d.celdas[fila.key] || { nivel: 1, resumen: "" };
                const color = NIVEL_COLOR[celda.nivel] || NIVEL_COLOR[1];
                const texto = celda.dividido
                  ? (celda.grupos || []).map((g) => `${g.etiqueta || "Grupo"}: ${g.resumen || "—"}`).join(" · ")
                  : celda.resumen || "";
                return (
                  <div
                    key={fila.key + d.fecha}
                    onClick={() => onAbrirCelda(d.fecha, fila.key)}
                    style={{
                      position: "relative",
                      borderRadius: 8,
                      border: `1.5px solid ${color.border}`,
                      background: color.bg,
                      color: color.text,
                      padding: "8px 8px 6px",
                      minHeight: 58,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {puedeGuardar && (
                      <button
                        title="Cambiar nivel (baja/media/alta)"
                        onClick={(e) => {
                          e.stopPropagation();
                          const siguiente = celda.nivel === 3 ? 1 : celda.nivel + 1;
                          onCambiarNivel(d.fecha, fila.key, siguiente);
                        }}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 11,
                          height: 11,
                          borderRadius: 3,
                          border: "none",
                          cursor: "pointer",
                          background: color.border,
                        }}
                      />
                    )}
                    <div style={{ marginTop: 12 }}>{texto}</div>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }} className="no-print">
        {puedeGuardar && (
          <button className="small-btn" onClick={onAgregarFila}>
            + Agregar fila
          </button>
        )}
        {puedeEliminar && (
          <button
            className="small-btn"
            onClick={() => {
              if (confirm("¿Restablecer esta semana a la planificación sugerida? Se pierde lo que hayas editado a mano.")) {
                onRestablecer();
              }
            }}
          >
            Restablecer sugerido
          </button>
        )}
        <button className="small-btn" onClick={() => window.print()}>
          Imprimir / PDF
        </button>
      </div>
    </div>
  );
}
