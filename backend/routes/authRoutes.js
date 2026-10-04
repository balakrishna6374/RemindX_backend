import { Router } from "express";
import { register, login, getMe, updateProfile } from "../controllers/authController.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { updateProfileSchema } from "../validators/userValidator.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();
router.post("/register", authLimiter, validateBody(registerSchema), register);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, validateBody(updateProfileSchema), updateProfile);
export default router;
