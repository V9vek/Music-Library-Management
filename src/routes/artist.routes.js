import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllArtists,
  getArtistById,
  addArtist,
  updateArtist,
  deleteArtist,
} from "../controllers/artist.controller.js";
import { verifyRole } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/").get(verifyJWT, getAllArtists);
router.route("/:id").get(verifyJWT, getArtistById);
router.route("/add-artist").post(verifyJWT, verifyRole(["Admin"]), addArtist);
router.route("/:id").put(verifyJWT, verifyRole(["Admin", "Editor"]), updateArtist);
router.route("/:id").delete(verifyJWT, verifyRole(["Admin"]), deleteArtist);

export default router;
