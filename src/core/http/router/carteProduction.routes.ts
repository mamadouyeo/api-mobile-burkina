import { Router } from "express";
import multer from "multer";
import path from "path";
import { verifyToken } from "../Middleware/auth.middleware";

// ⚙️ Import des contrôleurs
import {
  getAllCarteProductionsController,
  updateCartePhoto,
  distributeCarte,
  getCarte,
  updateCarteByUniqueCodes,          // ✅ contrôleur pour obtenir une carte
  searchCarte,        // ✅ contrôleur pour recherche
} from "../controllers/carteProduction.controller";

const router = Router();

/* --------------------------------------------- ⚙️ MULTER : Upload local des photos ------------------------------------------------ */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* --------------------------------------------- 📸 Mise à jour de la photo ------------------------------------------------ */
router.put("/carte/photo/:unique_code", verifyToken, upload.single("photo"), updateCartePhoto);

/* --------------------------------------------- 📌 Obtenir toutes les cartes produites ou non distribuées ------------------------------------------------ */
router.get("/carte/gestall", verifyToken, getAllCarteProductionsController);

/* --------------------------------------------- 🔍 Recherche carte par nom/prenoms/date ------------------------------------------------ */
router.get("/carte/searchs", verifyToken, searchCarte);

/* --------------------------------------------- 🔍 Obtenir une carte par unique_code ------------------------------------------------ */
router.get("/carte/:unique_code", verifyToken, getCarte);

/* --------------------------------------------- ✏️ Mise à jour d’une carte par unique_code ------------------------------------------------ */
router.put("/carte/:unique_code", verifyToken, updateCarteByUniqueCodes);

/* --------------------------------------------- 🚚 Distribution de carte ------------------------------------------------ */
router.put("/carte/distribute/:unique_code", verifyToken, distributeCarte);

export default router;
