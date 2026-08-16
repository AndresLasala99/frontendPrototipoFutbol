import { Router } from "express";
import * as jugadoresController from "../controllers/jugadores.controllers.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { bloquearColaboradorEscritura } from "../middlewares/soloLectura.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateBody } from "../middlewares/validateBody.middleware.js";
import {
  crearJugadorSchema,
  editarJugadorSchema,
  lesionSchema,
  cargaControladaSchema,
} from "../validators/jugadores.validators.js";

const router = Router();

router.use(authenticate);
router.use(bloquearColaboradorEscritura);

router.get("/", jugadoresController.listar);
router.get("/:id", jugadoresController.obtener);
router.get("/:id/disponibilidad", jugadoresController.disponibilidad);

router.post("/", validateBody(crearJugadorSchema), jugadoresController.crear);
router.patch("/:id", validateBody(editarJugadorSchema), jugadoresController.editar);
router.delete("/:id", authorize("admin", "dt"), jugadoresController.eliminar);

router.post("/:id/lesiones", validateBody(lesionSchema), jugadoresController.agregarLesion);
router.patch("/:id/lesiones/:lesionId", jugadoresController.editarLesion);
router.delete("/:id/lesiones/:lesionId", jugadoresController.eliminarLesion);

router.post(
  "/:id/carga-controlada",
  validateBody(cargaControladaSchema),
  jugadoresController.agregarCargaControlada
);
router.delete("/:id/carga-controlada/:cargaId", jugadoresController.eliminarCargaControlada);

router.post("/:id/estadisticas", jugadoresController.agregarEstadisticaPartido);
router.delete("/:id/estadisticas", jugadoresController.eliminarEstadisticaPartido);

export default router;
