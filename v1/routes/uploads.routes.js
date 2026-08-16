import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { subir } from "../controllers/uploads.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { bloquearColaboradorEscritura } from "../middlewares/soloLectura.middleware.js";

const router = Router();

router.use(authenticate);
router.use(bloquearColaboradorEscritura);
router.post("/", upload.single("imagen"), subir);

export default router;
