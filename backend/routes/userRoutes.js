import { Router } from "express";
import { getMe, updateProfile } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { updateProfileSchema } from "../validators/userValidator.js";

const router = Router();
router.use(authenticate);
router.get("/profile", getMe);
router.put("/profile", validateBody(updateProfileSchema), updateProfile);
export default router;
