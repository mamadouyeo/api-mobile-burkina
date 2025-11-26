import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

export const appConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "2025", 10),
  publicPort: parseInt(process.env.PUBLIC_PORT || "2025", 10),
  urlApp: process.env.URL_APP || "http://localhost:2025",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8012",
  logLevel: process.env.LOG_LEVEL || "info",
};

export const dbConfig = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "sa#123",
  database: process.env.DB_DATABASE || "IDCaptureCCBurkina",
  server: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  requestTimeout: 30000,
};
