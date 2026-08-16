import { Router } from "express";
import * as gpsController from "../controllers/gps.controllers.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { bloquearColaboradorEscritura } from "../middlewares/soloLectura.middleware.js";
import { validateBody } from "../middlewares/validateBody.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { guardarValoresGpsSchema, metricaSchema } from "../validators/gps.validators.js";

const router = Router();

router.use(authenticate);
router.use(bloquearColaboradorEscritura);

router.get("/metrica", gpsController.obtenerMetrica);
router.patch("/metrica", validateBody(metricaSchema), gpsController.guardarMetrica);

router.get("/acumulado", gpsController.acumulado); // ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
router.get("/jugador/:jugadorId", gpsController.historialJugador);

router.post("/extraer-imagen", upload.single("imagen"), gpsController.extraerDesdeImagen);

router.get("/:fecha", gpsController.obtenerRegistro);
router.patch("/:fecha", validateBody(guardarValoresGpsSchema), gpsController.guardarValores);

export default router;
