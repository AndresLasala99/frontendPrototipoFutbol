import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/auth.slice";
import InjuryAlertBanner from "../InjuryAlertBanner";
import { puedeEditar } from "../../utils/permisos";

export default function Layout({ children }) {
  const dispatch = useDispatch();
  const usuario = useSelector((state) => state.auth.usuario);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Organizador de microciclo</h1>
          <p className="subtitle">Marcá los partidos y el microciclo entre cada dos fechas se arma solo.</p>
        </div>
        <div className="header-right">
          {usuario && (
            <span className="user-pill">
              {usuario.nombre} · {usuario.rol}
            </span>
          )}
          <button className="small-btn" onClick={() => dispatch(logout())}>
            Salir
          </button>
        </div>
      </header>

      {usuario && !puedeEditar(usuario) && (
        <p className="subtitle warn" style={{ margin: "0 0 14px" }}>
          👁️ Estás con rol "colaborador": podés ver todo, pero no podés cargar ni editar nada.
        </p>
      )}

      <InjuryAlertBanner />

      <nav className="tabs">
        <NavLink to="/dashboard/calendario" className={({ isActive }) => (isActive ? "tab-btn active" : "tab-btn")}>
          📅 Calendario y microciclos
        </NavLink>
        <NavLink to="/dashboard/plantel" className={({ isActive }) => (isActive ? "tab-btn active" : "tab-btn")}>
          👥 Plantel
        </NavLink>
      </nav>

      <main className="app-content">{children}</main>
    </div>
  );
}
