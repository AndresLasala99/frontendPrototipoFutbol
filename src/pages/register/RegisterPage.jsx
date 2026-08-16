import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registroThunk } from "../../store/auth.slice";

// Por ahora, mientras el resto de los roles está en stand by, cualquiera que se
// registre queda como "dt" directamente (sin elegir rol).
export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cargando, error } = useSelector((state) => state.auth);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await dispatch(registroThunk({ ...form, rol: "dt" }));
    if (registroThunk.fulfilled.match(resultado)) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        {error && <p className="error-text">{error}</p>}
        <label>Nombre</label>
        <input name="nombre" value={form.nombre} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Contraseña</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
        <button type="submit" disabled={cargando}>
          {cargando ? "Creando..." : "Crear cuenta"}
        </button>
        <p className="auth-switch">
          ¿Ya tenés cuenta? <Link to="/login">Entrá acá</Link>
        </p>
      </form>
    </div>
  );
}
