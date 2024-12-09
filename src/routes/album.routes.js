import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import {
  addAlbum,
  deleteAlbum,
  getAlbumById,
  getAllAlbums,
  updateAlbum,
} from "../controllers/album.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getAllAlbums);
router.route("/:id").get(verifyJWT, getAlbumById);
router.route("/add-album").post(verifyJWT, verifyRole(["Admin"]), addAlbum);
router
  .route("/:id")
  .put(verifyJWT, verifyRole(["Admin", "Editor"]), updateAlbum);
router.route("/:id").delete(verifyJWT, verifyRole(["Admin"]), deleteAlbum);

export default router;
