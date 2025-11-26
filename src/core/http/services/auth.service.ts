import { getConnection } from "../../db/db";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";

export interface Utilisateur {
  idutilisateur: number;
  nom: string;
  prenom: string;
  login: string;
  mdp: string;
  uestactif: boolean;
  idrole: number;
}

// On force le typage en Secret (string garanti)
const JWT_SECRET: Secret = process.env.JWT_SECRET || "super_secret";

/** Inscription */
export async function registerUser(data: {
  nom: string;
  prenom: string;
  login: string;
  mdp: string;
  idrole: number;
}): Promise<Partial<Utilisateur>> {
  const pool = await getConnection();
  const hashedPassword = await bcrypt.hash(data.mdp, 10);

  const request = pool.request();
  request.input("nom", data.nom);
  request.input("prenom", data.prenom);
  request.input("login", data.login);
  request.input("mdp", hashedPassword);
  request.input("idrole", data.idrole);

  const query = `
    INSERT INTO utilisateurs (nom, prenom, login, mdp, uestactif, idrole)
    OUTPUT INSERTED.idutilisateur, INSERTED.nom, INSERTED.prenom, INSERTED.login, INSERTED.uestactif, INSERTED.idrole
    VALUES (@nom, @prenom, @login, @mdp, 1, @idrole)
  `;

  const result = await request.query(query);
  return result.recordset[0];
}

/** Connexion */
export async function loginUser(login: string, mdp: string): Promise<{ token: string; user: Partial<Utilisateur> }> {
  const pool = await getConnection();
  const request = pool.request();
  request.input("login", login);

  const query = `SELECT * FROM utilisateurs WHERE login = @login AND uestactif = 1`;
  const result = await request.query(query);

  if (result.recordset.length === 0) {
    throw new Error("Utilisateur introuvable ou inactif");
  }

  const user = result.recordset[0] as Utilisateur;
  const isMatch = await bcrypt.compare(mdp, user.mdp);
  if (!isMatch) {
    throw new Error("Mot de passe incorrect");
  }

  // ✅ JWT_SECRET est bien typé comme Secret
  const token = jwt.sign(
    { id: user.idutilisateur, login: user.login, idrole: user.idrole },
    JWT_SECRET,
    { expiresIn: "10h" }
  );

  // On ne retourne pas le mot de passe
  const { mdp: _, ...safeUser } = user;
  return { token, user: safeUser };
}

/** Profil */
export async function getProfile(idutilisateur: number): Promise<Partial<Utilisateur> | null> {
  const pool = await getConnection();
  const request = pool.request();
  request.input("idutilisateur", idutilisateur);

  const query = `SELECT idutilisateur, nom, prenom, login, uestactif, idrole
                 FROM utilisateurs
                 WHERE idutilisateur = @idutilisateur`;

  const result = await request.query(query);
  if (result.recordset.length === 0) return null;
  return result.recordset[0];
}
