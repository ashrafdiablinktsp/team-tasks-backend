import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware, adminMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.post("/", adminMiddleware, UserController.createUser);
router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.patch("/:id", UserController.updateUser);
router.delete("/:id", adminMiddleware, UserController.deleteUser);

export default router;
