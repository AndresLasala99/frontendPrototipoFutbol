import { Router } from "express";
import * as sentidoController from "../controllers/sentido.controllers.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { bloquearColaboradorEscritura } from "../middlewares/soloLectura.middleware.js";
import { validateBody } from "../middlewares/validateBody.middleware.js";
import { salioSentidoSchema } from "../validators/sentido.validators.js";

const router = Router();

router.use(authenticate);
router.use(bloquearColaboradorEscritura);

router.get("/:fecha", sentidoController.listarPorFecha);
router.post("/", validateBody(salioSentidoSchema), sentidoController.marcar);
router.delete("/:fecha/:jugadorId", sentidoController.quitar);

export default router;
