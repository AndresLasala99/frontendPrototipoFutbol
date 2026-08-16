import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDaysISO, toISO } from "../utils/date";
import { cargarJugadores } from "../store/jugadores.slice";

export default function InjuryAlertBanner() {
  const dispatch = useDispatch();
  const jugadores = useSelector((state) => state.jugadores.lista);

  useEffect(() => {
    if (jugadores.length === 0) dispatch(cargarJugadores());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hoy = toISO(new Date());
  const en3dias = addDaysISO(hoy, 3);
  const hace5dias = addDaysISO(hoy, -5);

  const proximasAVencer = [];
  const vencidasSinActualizar = [];

  jugadores.forEach((j) => {
    (j.lesiones || []).forEach((l) => {
      if (l.hasta >= hoy && l.hasta <= en3dias) {
        proximasAVencer.push({ jugador: j.nombre, lesion: l });
      } else if (l.hasta < hoy && l.hasta >= hace5dias) {
        vencidasSinActualizar.push({ jugador: j.nombre, lesion: l });
      }
    });
  });

  if (proximasAVencer.length === 0 && vencidasSinActualizar.length === 0) return null;

  return (
    <div className="panel" style={{ borderColor: "#f5a623", background: "#fff8e1" }}>
      {proximasAVencer.map((x, i) => (
        <div key={"p" + i} style={{ fontSize: 13 }}>
          🟡 <b>{x.jugador}</b> vuelve de "{x.lesion.texto || "su lesión"}" el {x.lesion.hasta}.
        </div>
      ))}
      {vencidasSinActualizar.map((x, i) => (
        <div key={"v" + i} style={{ fontSize: 13 }}>
          ⚠️ La lesión de <b>{x.jugador}</b> ("{x.lesion.texto || "sin detalle"}") venció el {x.lesion.hasta} — revisá si ya está disponible.
        </div>
      ))}
    </div>
  );
}
