import { Router } from "express";
import * as microciclosController from "../controllers/microciclos.controllers.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { bloquearColaboradorEscritura } from "../middlewares/soloLectura.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateBody } from "../middlewares/validateBody.middleware.js";
import { celdaSchema, filaSchema } from "../validators/microciclos.validators.js";
import Joi from "joi";

const router = Router();

router.use(authenticate);
router.use(bloquearColaboradorEscritura);

router.get("/gaps", microciclosController.listarGaps);

router.get("/:fechaDesde/:fechaHasta", microciclosController.obtener);

router.post(
  "/:fechaDesde/:fechaHasta/restablecer",
  authorize("admin", "dt"),
  microciclosController.restablecerSugerido
);

router.patch(
  "/:fechaDesde/:fechaHasta/celda",
  validateBody(
    Joi.object({
      fecha: Joi.string().required(),
      filaKey: Joi.string().required(),
      datos: celdaSchema.required(),
    })
  ),
  microciclosController.actualizarCelda
);

router.patch(
  "/:fechaDesde/:fechaHasta/etiqueta",
  validateBody(
    Joi.object({
      fecha: Joi.string().required(),
      etiqueta: Joi.string().required(),
    })
  ),
  microciclosController.editarEtiquetaDia
);

router.post(
  "/:fechaDesde/:fechaHasta/filas",
  validateBody(filaSchema),
  microciclosController.agregarFila
);
router.delete(
  "/:fechaDesde/:fechaHasta/filas/:key",
  authorize("admin", "dt"),
  microciclosController.eliminarFila
);

export default router;
