import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUsersUnderAdmin,
  addUserUnderAdmin,
  deleteUser,
  updatePassword,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/users/update-password").put(verifyJWT, updatePassword);

router
  .route("/users")
  .get(verifyJWT, verifyRole(["Admin"]), getUsersUnderAdmin);

router
  .route("/users/add-user")
  .post(verifyJWT, verifyRole(["Admin"]), addUserUnderAdmin);

router.route("/users/:id").delete(verifyJWT, verifyRole(["Admin"]), deleteUser);

export default router;
