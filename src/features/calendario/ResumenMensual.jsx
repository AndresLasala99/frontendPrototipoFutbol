import { useState } from "react";
import * as microciclosApi from "../../api/microciclos.api";
import { shortDate, addDaysISO } from "../../utils/date";

function monthKeyOf(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
}

const NIVEL_INFO = { 1: ["Carga baja", "#34a853"], 2: ["Carga media", "#f5a623"], 3: ["Prioridad alta", "#e53e3e"] };

export default function ResumenMensual({ gaps, jugadores, viewDate }) {
  const [valor, setValor] = useState(monthKeyOf(viewDate));
  const [panorama, setPanorama] = useState(null);

  const rangoDelMes = () => {
    const [y, m] = valor.split("-").map(Number);
    const inicio = valor + "-01";
    const ultimoDia = new Date(y, m, 0).getDate();
    const fin = valor + "-" + String(ultimoDia).padStart(2, "0");
    return { inicio, fin };
  };

  const verPanorama = async () => {
    const { inicio, fin } = rangoDelMes();
    const relevantes = gaps.filter((g) => g.fechaDesde <= fin && g.fechaHasta >= inicio);
    const conteo = { 1: 0, 2: 0, 3: 0 };
    for (const gap of relevantes) {
      const micro = await microciclosApi.obtenerMicrociclo(gap.fechaDesde, gap.fechaHasta);
      micro.dias.forEach((d) => {
        if (d.fecha < inicio || d.fecha > fin) return;
        micro.filas.forEach((fila) => {
          const celda = d.celdas[fila.key];
          if (celda) conteo[celda.nivel] = (conteo[celda.nivel] || 0) + 1;
        });
      });
    }
    setPanorama(conteo);
  };

  const descargar = async () => {
    const { inicio, fin } = rangoDelMes();
    const relevantes = gaps.filter((g) => g.fechaDesde <= fin && g.fechaHasta >= inicio);

    let html = `<html><head><meta charset="utf-8"><title>Resumen ${valor}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;max-width:800px;margin:0 auto;color:#222;}
    h1{font-size:20px;} h2{font-size:16px;margin-top:28px;border-bottom:1px solid #ddd;padding-bottom:6px;}
    h3{font-size:14px;margin:16px 0 6px;}
    .day{margin-bottom:14px;padding:12px;border:1px solid #eee;border-radius:8px;}
    .lvl{display:inline-block;padding:1px 8px;border-radius:10px;font-size:11px;margin-left:6px;}
    .l1{background:#eaf7ec;color:#1e7e34;} .l2{background:#fff8e1;color:#92610a;} .l3{background:#fdecea;color:#a51b1b;}
    .players{font-size:12px;color:#555;margin-top:4px;}</style></head><body>`;
    html += `<h1>Resumen mensual — ${valor}</h1>`;
    html += `<h2>Plantel</h2><p>${jugadores.map((j) => j.nombre).join(", ") || "Sin cargar"}</p>`;

    const lesionadosDelMes = [];
    jugadores.forEach((j) => {
      (j.lesiones || []).forEach((l) => {
        if (l.desde && l.hasta && l.desde <= fin && l.hasta >= inicio) {
          lesionadosDelMes.push({ nombre: j.nombre, lesion: l });
        }
      });
    });
    html += `<h2>Lesionados en el mes</h2>`;
    if (lesionadosDelMes.length === 0) {
      html += `<p>Ninguno registrado.</p>`;
    } else {
      html += `<ul>`;
      lesionadosDelMes.forEach(({ nombre, lesion }) => {
        html += `<li>${nombre} — ${lesion.texto || "sin detalle"} (${lesion.desde} a ${lesion.hasta})</li>`;
      });
      html += `</ul>`;
    }

    const NIVEL_LABEL = { 1: "Baja", 2: "Media", 3: "Alta" };

    if (relevantes.length === 0) {
      html += `<p>No hay microciclos cargados para este mes.</p>`;
    }
    for (const gap of relevantes) {
      const micro = await microciclosApi.obtenerMicrociclo(gap.fechaDesde, gap.fechaHasta);
      html += `<h2>Microciclo ${shortDate(addDaysISO(gap.fechaDesde, 1))} → ${shortDate(gap.fechaHasta)}</h2>`;
      micro.dias.forEach((d) => {
        if (d.fecha < inicio || d.fecha > fin) return;
        html += `<div class="day"><h3>${d.etiqueta} — ${shortDate(d.fecha)}</h3>`;
        micro.filas.forEach((fila) => {
          const celda = d.celdas[fila.key];
          if (!celda) return;
          html += `<div style="margin-bottom:8px;"><b>${fila.label}</b><span class="lvl l${celda.nivel}">${NIVEL_LABEL[celda.nivel] || ""}</span>`;
          if (celda.dividido) {
            (celda.grupos || []).forEach((g) => {
              const idsGrupo = g.jugadores !== null && g.jugadores !== undefined ? g.jugadores : jugadores.map((j) => j._id);
              const nombresGrupo = jugadores.filter((j) => idsGrupo.includes(j._id)).map((j) => j.nombre).join(", ");
              html += `<div style="margin-left:10px;margin-top:6px;"><i>${g.etiqueta || "Grupo"}</i>: ${g.resumen || ""} ${
                g.detalle ? "— " + g.detalle : ""
              }${nombresGrupo ? `<div class="players">Jugadores: ${nombresGrupo}</div>` : ""}</div>`;
            });
          } else {
            const idsCelda = celda.jugadores !== null && celda.jugadores !== undefined ? celda.jugadores : jugadores.map((j) => j._id);
            const nombresCelda = jugadores.filter((j) => idsCelda.includes(j._id)).map((j) => j.nombre).join(", ");
            html += `<div>${celda.resumen || ""} ${celda.detalle ? "— " + celda.detalle : ""}</div>`;
            if (nombresCelda) html += `<div class="players">Jugadores: ${nombresCelda}</div>`;
          }
          html += `</div>`;
        });
        html += `</div>`;
      });
    }
    html += `</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Resumen_${valor}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel">
      <h3 className="panel-title">Resumen mensual</h3>
      <p className="note">Generá un panorama del mes o un archivo descargable con el detalle de los microciclos.</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input type="month" value={valor} onChange={(e) => { setValor(e.target.value); setPanorama(null); }} />
        <button className="small-btn" onClick={verPanorama}>
          📊 Ver panorama del mes
        </button>
        <button className="small-btn" onClick={descargar}>
          📥 Descargar resumen
        </button>
      </div>

      {panorama && (
        <div style={{ marginTop: 14 }}>
          {(panorama[1] + panorama[2] + panorama[3]) === 0 ? (
            <p className="note">No hay microciclos cargados para este mes.</p>
          ) : (
            [1, 2, 3].map((nivel) => {
              const total = panorama[1] + panorama[2] + panorama[3];
              const cantidad = panorama[nivel] || 0;
              const pct = total ? Math.round((cantidad / total) * 100) : 0;
              const [label, color] = NIVEL_INFO[nivel];
              return (
                <div key={nivel} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span>{label}</span>
                    <span>{cantidad} celdas ({pct}%)</span>
                  </div>
                  <div style={{ background: "#eee", borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", background: color, height: "100%" }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
