import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as partidosApi from "../../api/partidos.api";
import * as campeonatosApi from "../../api/campeonatos.api";
import * as microciclosApi from "../../api/microciclos.api";
import { cargarJugadores } from "../../store/jugadores.slice";
import { puedeAdministrar, puedeEditar } from "../../utils/permisos";
import CampeonatosPanel from "./CampeonatosPanel";
import MonthCalendar from "./MonthCalendar";
import GapsList from "./GapsList";
import MatchPanel from "./MatchPanel";
import MicrocicloGrid from "./MicrocicloGrid";
import CellDetailPanel from "./CellDetailPanel";
import VistaHoy from "./VistaHoy";
import ResumenMensual from "./ResumenMensual";

export default function CalendarioPage() {
  const dispatch = useDispatch();
  const jugadores = useSelector((state) => state.jugadores.lista);
  const usuario = useSelector((state) => state.auth.usuario);
  const esAdmin = puedeAdministrar(usuario);
  const puedeGuardar = puedeEditar(usuario);

  const [viewDate, setViewDate] = useState(new Date());
  const [partidos, setPartidos] = useState([]);
  const [campeonatos, setCampeonatos] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [gapSeleccionado, setGapSeleccionado] = useState(null);
  const [microciclo, setMicrociclo] = useState(null);
  const [fechaPartidoAbierto, setFechaPartidoAbierto] = useState(null);
  const [celdaAbierta, setCeldaAbierta] = useState(null); // { fecha, filaKey, filaLabel }

  const cargarPartidos = async () => setPartidos(await partidosApi.listarPartidos());
  const cargarGaps = async (irAlUltimo = false) => {
    const lista = await microciclosApi.listarGaps();
    setGaps(lista);
    if (lista.length > 0 && (irAlUltimo || !gapSeleccionado)) {
      setGapSeleccionado(lista[lista.length - 1]);
    }
  };

  useEffect(() => {
    dispatch(cargarJugadores());
    cargarPartidos();
    cargarGaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gapSeleccionado) {
      microciclosApi.obtenerMicrociclo(gapSeleccionado.fechaDesde, gapSeleccionado.fechaHasta).then(setMicrociclo);
    }
  }, [gapSeleccionado]);

  const handleDiaClick = async (fecha, yaEsPartido) => {
    if (yaEsPartido) {
      setFechaPartidoAbierto(fecha);
      return;
    }
    if (!puedeGuardar) return;
    let campeonatoId = null;
    if (campeonatos.length > 0) {
      const lista = campeonatos.map((c, i) => `${i + 1}. ${c.nombre}`).join("\n");
      const eleccion = prompt(
        `¿A qué campeonato pertenece este partido?\n${lista}\n\nEscribí el número, o un nombre nuevo si no está en la lista. Cancelá para no marcar nada.`
      );
      if (eleccion === null) return; // canceló: no se crea el partido
      if (eleccion.trim()) {
        const num = parseInt(eleccion, 10);
        if (!isNaN(num) && campeonatos[num - 1]) {
          campeonatoId = campeonatos[num - 1]._id;
        } else {
          const nuevo = await campeonatosApi.crearCampeonato(eleccion.trim());
          campeonatoId = nuevo._id;
          setCampeonatos([...campeonatos, nuevo]);
        }
      }
    }
    await partidosApi.crearPartido(fecha, campeonatoId);
    await cargarPartidos();
    await cargarGaps(true);
  };

  const handleEditarEtiqueta = async (fecha, etiqueta) => {
    if (!gapSeleccionado) return;
    const actualizado = await microciclosApi.editarEtiquetaDia(gapSeleccionado.fechaDesde, gapSeleccionado.fechaHasta, fecha, etiqueta);
    setMicrociclo(actualizado);
  };

  const handleCambiarNivel = async (fecha, filaKey, nivel) => {
    if (!gapSeleccionado) return;
    const actualizado = await microciclosApi.actualizarCelda(gapSeleccionado.fechaDesde, gapSeleccionado.fechaHasta, fecha, filaKey, { nivel });
    setMicrociclo(actualizado);
  };

  const handleAgregarFila = async () => {
    if (!gapSeleccionado) return;
    const key = "fila_" + Date.now();
    const actualizado = await microciclosApi.agregarFila(gapSeleccionado.fechaDesde, gapSeleccionado.fechaHasta, { key, label: "Nueva fila" });
    setMicrociclo(actualizado);
  };

  const handleEliminarFila = async (key) => {
    if (!gapSeleccionado) return;
    const actualizado = await microciclosApi.eliminarFila(gapSeleccionado.fechaDesde, gapSeleccionado.fechaHasta, key);
    setMicrociclo(actualizado);
  };

  const handleRestablecer = async () => {
    if (!gapSeleccionado) return;
    const actualizado = await microciclosApi.restablecerSugerido(gapSeleccionado.fechaDesde, gapSeleccionado.fechaHasta);
    setMicrociclo(actualizado);
  };

  const recargarMicrociclo = async () => {
    if (!gapSeleccionado) return;
    setMicrociclo(await microciclosApi.obtenerMicrociclo(gapSeleccionado.fechaDesde, gapSeleccionado.fechaHasta));
  };

  return (
    <div>
      <VistaHoy gaps={gaps} />

      <CampeonatosPanel campeonatos={campeonatos} onCambio={setCampeonatos} puedeEliminar={esAdmin} puedeGuardar={puedeGuardar} />

      <MonthCalendar
        viewDate={viewDate}
        setViewDate={setViewDate}
        partidos={partidos}
        campeonatos={campeonatos}
        onDiaClick={handleDiaClick}
        puedeEliminar={esAdmin}
        gapSeleccionado={gapSeleccionado}
        onEliminarPartido={async (fecha) => {
          await partidosApi.eliminarPartido(fecha);
          await cargarPartidos();
          await cargarGaps();
        }}
      />

      <GapsList gaps={gaps} viewDate={viewDate} gapSeleccionado={gapSeleccionado} onSeleccionar={setGapSeleccionado} />

      {microciclo && (
        <MicrocicloGrid
          microciclo={microciclo}
          puedeEliminar={esAdmin}
          puedeGuardar={puedeGuardar}
          onEditarEtiqueta={handleEditarEtiqueta}
          onCambiarNivel={handleCambiarNivel}
          onAbrirCelda={(fecha, filaKey) => {
            const fila = microciclo.filas.find((f) => f.key === filaKey);
            setCeldaAbierta({ fecha, filaKey, filaLabel: fila?.label || filaKey });
          }}
          onAgregarFila={handleAgregarFila}
          onEliminarFila={handleEliminarFila}
          onRestablecer={handleRestablecer}
        />
      )}

      <ResumenMensual gaps={gaps} jugadores={jugadores} viewDate={viewDate} />

      {fechaPartidoAbierto && (
        <MatchPanel
          fecha={fechaPartidoAbierto}
          jugadores={jugadores}
          campeonatos={campeonatos}
          puedeEliminar={esAdmin}
          puedeGuardar={puedeGuardar}
          onClose={() => setFechaPartidoAbierto(null)}
          onEliminado={async () => {
            setFechaPartidoAbierto(null);
            await cargarPartidos();
            await cargarGaps();
          }}
          onCambio={() => {
            cargarPartidos();
            dispatch(cargarJugadores());
          }}
        />
      )}

      {celdaAbierta && gapSeleccionado && (
        <CellDetailPanel
          fechaDesde={gapSeleccionado.fechaDesde}
          fechaHasta={gapSeleccionado.fechaHasta}
          fecha={celdaAbierta.fecha}
          filaKey={celdaAbierta.filaKey}
          filaLabel={celdaAbierta.filaLabel}
          jugadores={jugadores}
          puedeGuardar={puedeGuardar}
          onClose={() => setCeldaAbierta(null)}
          onGuardado={recargarMicrociclo}
        />
      )}
    </div>
  );
}
