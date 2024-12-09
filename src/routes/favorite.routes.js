import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import {
  addFavroite,
  deleteFavorite,
  getFavorites,
} from "../controllers/favorite.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getFavorites);
router.route("/add-favorite").post(verifyJWT, addFavroite);
router.route("/remove-favorite/:id").delete(verifyJWT, deleteFavorite);

export default router;
