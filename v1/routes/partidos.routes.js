import { Router } from "express";
import * as partidosController from "../controllers/partidos.controllers.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { bloquearColaboradorEscritura } from "../middlewares/soloLectura.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateBody } from "../middlewares/validateBody.middleware.js";
import {
  crearPartidoSchema,
  editarPartidoSchema,
  citadosSchema,
  minutosSchema,
} from "../validators/partidos.validators.js";

const router = Router();

router.use(authenticate);
router.use(bloquearColaboradorEscritura);

router.get("/", partidosController.listar);
router.get("/:fecha", partidosController.obtener);

router.post("/", validateBody(crearPartidoSchema), partidosController.crear);
router.patch("/:fecha", validateBody(editarPartidoSchema), partidosController.editar);
router.delete("/:fecha", authorize("admin", "dt"), partidosController.eliminar);

router.patch("/:fecha/citados", validateBody(citadosSchema), partidosController.setCitados);
router.patch("/:fecha/minutos", validateBody(minutosSchema), partidosController.setMinutos);

export default router;
