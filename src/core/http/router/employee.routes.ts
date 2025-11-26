import { Router } from "express";
import { transferEmployeeToICS } from "../controllers/employee.controller";
import { verifyToken } from "../Middleware/auth.middleware";

const router = Router();

// PUT /api/employees/:unique_code
router.put("/employe/:unique_code",verifyToken, transferEmployeeToICS);

export default router;
