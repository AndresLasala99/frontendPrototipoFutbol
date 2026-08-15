import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Página no encontrada</h1>
      <Link to="/dashboard">Volver</Link>
    </div>
  );
}
