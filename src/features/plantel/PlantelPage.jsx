import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  cargarJugadores,
  crearJugadorThunk,
  editarJugadorThunk,
  eliminarJugadorThunk,
  actualizarJugadorLocal,
} from "../../store/jugadores.slice";
import * as jugadoresApi from "../../api/jugadores.api";
import * as campeonatosApi from "../../api/campeonatos.api";
import { puedeAdministrar, puedeEditar } from "../../utils/permisos";
import PlayerCard from "./PlayerCard";
import PlayerProfileModal from "./PlayerProfileModal";

export default function PlantelPage() {
  const dispatch = useDispatch();
  const { lista, cargando } = useSelector((state) => state.jugadores);
  const usuario = useSelector((state) => state.auth.usuario);
  const esAdmin = puedeAdministrar(usuario);
  const puedeGuardar = puedeEditar(usuario);
  const [jugadorAbierto, setJugadorAbierto] = useState(null);
  const [campeonatos, setCampeonatos] = useState([]);

  useEffect(() => {
    dispatch(cargarJugadores());
    campeonatosApi.listarCampeonatos().then(setCampeonatos);
  }, [dispatch]);

  const agregarJugador = async () => {
    const resultado = await dispatch(crearJugadorThunk({ nombre: "Nuevo jugador" }));
    if (crearJugadorThunk.fulfilled.match(resultado)) {
      setJugadorAbierto(resultado.payload);
    }
  };

  const toggleLesion = async (jugador) => {
    const hoyISO = new Date().toISOString().slice(0, 10);
    const lesionActiva = (jugador.lesiones || []).find((l) => hoyISO >= l.desde && hoyISO <= l.hasta);

    try {
      if (lesionActiva) {
        if (!confirm("¿Marcar como apto? Se cierra la lesión activa con fecha de hoy.")) return;
        const actualizado = await jugadoresApi.editarLesion(jugador._id, lesionActiva._id, { hasta: hoyISO });
        dispatch(actualizarJugadorLocal(actualizado));
      } else {
        const texto = prompt("¿Qué lesión tiene? (opcional)") || "";
        const estimada = prompt(
          "Fecha estimada de vuelta (AAAA-MM-DD). Es una estimación, se puede ajustar después:",
          hoyISO
        );
        if (estimada === null) return;
        const actualizado = await jugadoresApi.agregarLesion(jugador._id, {
          texto,
          desde: hoyISO,
          hasta: estimada || hoyISO,
        });
        dispatch(actualizarJugadorLocal(actualizado));
      }
    } catch (error) {
      alert("No se pudo guardar: " + (error.response?.data?.error || error.message));
    }
  };

  const toggleCarga = async (jugador) => {
    const hoyISO = new Date().toISOString().slice(0, 10);
    const cargaActiva = (jugador.cargasControladas || []).find((c) => hoyISO >= c.desde && hoyISO <= c.hasta);
    if (cargaActiva) {
      const actualizado = await jugadoresApi.eliminarCargaControlada(jugador._id, cargaActiva._id);
      dispatch(actualizarJugadorLocal(actualizado));
    } else {
      const motivo = prompt("Carga controlada — motivo (opcional, ej. carga de partido reciente, duda física):", "") || "";
      const actualizado = await jugadoresApi.agregarCargaControlada(jugador._id, { motivo, desde: hoyISO, hasta: hoyISO });
      dispatch(actualizarJugadorLocal(actualizado));
    }
  };

  const eliminarJugador = async (jugador) => {
    if (!confirm(`¿Eliminar a ${jugador.nombre} del plantel? No se borran sus estadísticas históricas, pero deja de aparecer en la lista.`)) return;
    await dispatch(eliminarJugadorThunk(jugador._id));
    setJugadorAbierto(null);
  };

  return (
    <div className="panel">
      <h3 className="panel-title">Plantel</h3>
      <p className="note">Tocá la tarjeta para ver el perfil completo. Tocá el círculo para cambiar el estado.</p>

      {cargando && <p className="note">Cargando plantel...</p>}

      <div className="player-cards">
        {lista.map((j) => (
          <PlayerCard
            key={j._id}
            jugador={j}
            onAbrir={setJugadorAbierto}
            onToggleLesion={puedeGuardar ? toggleLesion : undefined}
            onToggleCarga={puedeGuardar ? toggleCarga : undefined}
          />
        ))}
      </div>

      {puedeGuardar && (
        <button className="small-btn" style={{ marginTop: 14 }} onClick={agregarJugador}>
          + Agregar jugador
        </button>
      )}

      {jugadorAbierto && (
        <PlayerProfileModal
          jugador={jugadorAbierto}
          campeonatos={campeonatos}
          puedeEliminar={esAdmin}
          puedeGuardar={puedeGuardar}
          onEliminar={eliminarJugador}
          onClose={() => setJugadorAbierto(null)}
          onActualizado={(actualizado) => {
            dispatch(actualizarJugadorLocal(actualizado));
            setJugadorAbierto((actual) => (actual ? actualizado : actual));
          }}
        />
      )}
    </div>
  );
}
