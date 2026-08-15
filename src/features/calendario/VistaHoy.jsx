import { useEffect, useState } from "react";
import { toISO } from "../../utils/date";
import * as microciclosApi from "../../api/microciclos.api";

const NIVEL_LABEL = { 1: ["Baja", "#34a853"], 2: ["Media", "#f5a623"], 3: ["Alta", "#e53e3e"] };

export default function VistaHoy({ gaps }) {
  const [dia, setDia] = useState(null);
  const [filas, setFilas] = useState([]);

  useEffect(() => {
    const hoy = toISO(new Date());
    const gap = gaps.find((g) => hoy >= g.fechaDesde && hoy <= g.fechaHasta);
    if (!gap) {
      setDia(null);
      return;
    }
    microciclosApi.obtenerMicrociclo(gap.fechaDesde, gap.fechaHasta).then((micro) => {
      const d = micro.dias.find((x) => x.fecha === hoy);
      setDia(d || null);
      setFilas(micro.filas);
    });
  }, [gaps]);

  if (!dia) return null;

  return (
    <div className="panel" style={{ borderColor: "#222" }}>
      <h3 className="panel-title">
        Hoy · {dia.etiqueta} · {dia.fecha}
      </h3>
      {filas.map((fila) => {
        const celda = dia.celdas[fila.key];
        if (!celda) return null;
        return (
          <div key={fila.key} style={{ marginBottom: 8, fontSize: 13 }}>
            <b>{fila.label}</b>
            {celda.nivel && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  padding: "1px 8px",
                  borderRadius: 10,
                  background: (NIVEL_LABEL[celda.nivel] || NIVEL_LABEL[1])[1] + "22",
                  color: (NIVEL_LABEL[celda.nivel] || NIVEL_LABEL[1])[1],
                }}
              >
                {(NIVEL_LABEL[celda.nivel] || NIVEL_LABEL[1])[0]}
              </span>
            )}
            {celda.dividido ? (
              (celda.grupos || []).map((g, i) => (
                <div key={i} style={{ marginLeft: 10 }}>
                  <i>{g.etiqueta}</i>: {g.resumen}
                </div>
              ))
            ) : (
              <div>{celda.resumen}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
