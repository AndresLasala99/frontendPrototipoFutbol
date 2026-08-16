import { Router } from "express";
import authRoutes from "./routes/auth.routes.js";
import jugadoresRoutes from "./routes/jugadores.routes.js";
import campeonatosRoutes from "./routes/campeonatos.routes.js";
import partidosRoutes from "./routes/partidos.routes.js";
import microciclosRoutes from "./routes/microciclos.routes.js";
import gpsRoutes from "./routes/gps.routes.js";
import sentidoRoutes from "./routes/sentido.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/jugadores", jugadoresRoutes);
router.use("/campeonatos", campeonatosRoutes);
router.use("/partidos", partidosRoutes);
router.use("/microciclos", microciclosRoutes);
router.use("/gps", gpsRoutes);
router.use("/sentido", sentidoRoutes);
router.use("/uploads", uploadsRoutes);

export default router;
