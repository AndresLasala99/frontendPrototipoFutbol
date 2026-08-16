import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../../componentes/layout/Layout";
import CalendarioPage from "../../features/calendario/CalendarioPage";
import PlantelPage from "../../features/plantel/PlantelPage";

export default function DashboardPage() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Navigate to="calendario" replace />} />
        <Route path="calendario" element={<CalendarioPage />} />
        <Route path="plantel" element={<PlantelPage />} />
      </Routes>
    </Layout>
  );
}
