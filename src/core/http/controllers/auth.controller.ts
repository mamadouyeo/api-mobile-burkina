import { Request, Response } from "express";
import { registerUser, loginUser, getProfile } from "../services/auth.service";

/** POST /user/register */
export async function registerController(req: Request, res: Response) {
  try {
    const { nom, prenom, login, mdp, idrole } = req.body;
    if (!nom || !prenom || !login || !mdp || !idrole) {
      return res.status(400).json({ success: false, message: "Tous les champs sont requis" });
    }

    const user = await registerUser(req.body);
    return res.status(201).json({ success: true, message: "Utilisateur créé avec succès", data: user });
  } catch (err: any) {
    console.error("Erreur registerController:", err);
    return res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
  }
}

/** POST /user/login */
export async function loginController(req: Request, res: Response) {
  try {
    const { login, mdp } = req.body;
    if (!login || !mdp) {
      return res.status(400).json({ success: false, message: "Login et mot de passe requis" });
    }

    const { token, user } = await loginUser(login, mdp);
    return res.status(200).json({ success: true, message: "Connexion réussie", token, data: user });
  } catch (err: any) {
    console.error("Erreur loginController:", err);
    return res.status(401).json({ success: false, message: err.message || "Identifiants invalides" });
  }
}

/** GET /user/profile */
export async function profileController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(403).json({ success: false, message: "Token manquant ou invalide" });
    }

    const user = await getProfile(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({ success: true, message: "Profil récupéré avec succès", data: user });
  } catch (err: any) {
    console.error("Erreur profileController:", err);
    return res.status(500).json({ success: false, message: err.message || "Erreur serveur" });
  }
}
