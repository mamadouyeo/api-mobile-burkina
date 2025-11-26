import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { getConnection } from "./core/db/db"; 
import carteRoutes from "./core/http/router/carteProduction.routes";
import employeRoutes from "./core/http/router/employee.routes";
import authRoutes from "./core/http/router/auth.routes";
import { appConfig } from "./core/config/config"; // 👉 Config centralisée

const app = express();
const PORT = appConfig.port;

// Middlewares
app.use(express.json());
app.use(cors());

// 👉 Permet de servir les images uploadées
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes principales
app.use("/api/v1/idcapture/", carteRoutes);
app.use("/api/v1/idcapture/", employeRoutes);
app.use("/api/v1/idcapture/", authRoutes);

// Endpoint de test de connexion DB
app.get("/api/testconnection", async (req: Request, res: Response) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT GETDATE() as date"); 
    res.json({
      success: true,
      message: "Connexion réussie à la base de donnée",
      serverTime: result.recordset[0].date,
    });
  } catch (error) {
    console.error("❌ Erreur test DB:", error);
    res.status(500).json({ success: false, message: "Erreur de connexion DB", error });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé en mode ${appConfig.nodeEnv} sur ${appConfig.urlApp}`);
});
