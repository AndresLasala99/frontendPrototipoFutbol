import { Router } from "express";
import { registro, login } from "../controllers/auth.controllers.js";
import { validateBody } from "../middlewares/validateBody.middleware.js";
import { registroSchema, loginSchema } from "../validators/auth.validators.js";

const router = Router();

router.post("/registro", validateBody(registroSchema), registro);
router.post("/login", validateBody(loginSchema), login);

export default router;
