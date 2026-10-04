import { Router } from "express";
import {
  getEvents, getEventById, createEvent, updateEvent, deleteEvent, getEventSummary
} from "../controllers/eventController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { createEventSchema, updateEventSchema } from "../validators/eventValidator.js";

const router = Router();
router.use(authenticate);
router.get("/", getEvents);
router.get("/summary", getEventSummary);
router.get("/:id", getEventById);
router.post("/", validateBody(createEventSchema), createEvent);
router.put("/:id", validateBody(updateEventSchema), updateEvent);
router.delete("/:id", deleteEvent);
export default router;
