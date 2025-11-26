import sql, { ConnectionPool } from "mssql";
import { dbConfig } from "../config/config";

let pool: ConnectionPool | null = null;

/**
 * Établit une connexion SQL Server (singleton)
 */
export async function getConnection(): Promise<ConnectionPool> {
  if (pool) return pool;

  try {
    pool = await sql.connect(dbConfig);
    console.log("✅ Connexion SQL Server établie");
    return pool;
  } catch (err) {
    console.error("❌ Erreur de connexion à SQL Server :", err);
    await new Promise((res) => setTimeout(res, 3000));
    return getConnection(); // Retry
  }
}

/**
 * Ferme proprement la connexion SQL Server
 */
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("🛑 Connexion SQL Server fermée");
  }
}
