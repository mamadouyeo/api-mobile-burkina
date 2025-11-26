import { Router } from "express";
import { registerController, loginController, profileController } from "../controllers/auth.controller";
import { verifyToken } from "../Middleware/auth.middleware";


const router = Router();

router.post("/user/register", registerController);
router.post("/user/login", loginController);
router.get("/user/profile", verifyToken, profileController);

export default router;
