import { Router } from "express";
import * as campeonatosController from "../controllers/campeonatos.controllers.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { bloquearColaboradorEscritura } from "../middlewares/soloLectura.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateBody } from "../middlewares/validateBody.middleware.js";
import { campeonatoSchema, renombrarCampeonatoSchema } from "../validators/campeonatos.validators.js";

const router = Router();

router.use(authenticate);
router.use(bloquearColaboradorEscritura);

router.get("/", campeonatosController.listar);
router.post("/", validateBody(campeonatoSchema), campeonatosController.crear);
router.patch("/:id", validateBody(renombrarCampeonatoSchema), campeonatosController.renombrar);
router.delete("/:id", authorize("admin", "dt"), campeonatosController.eliminar);

export default router;
