import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import {
  addTrack,
  deleteTrack,
  getAllTracks,
  getTrackById,
  updateTrack,
} from "../controllers/track.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getAllTracks);
router.route("/:id").get(verifyJWT, getTrackById);
router.route("/add-track").post(verifyJWT, verifyRole(["Admin"]), addTrack);
router
  .route("/:id")
  .put(verifyJWT, verifyRole(["Admin", "Editor"]), updateTrack);
router.route("/:id").delete(verifyJWT, verifyRole(["Admin"]), deleteTrack);

export default router;
