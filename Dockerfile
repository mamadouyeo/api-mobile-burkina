# Étape 1 : Build avec TypeScript
FROM node:18-alpine AS builder

# Répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Copier le code source
COPY . .

# Compiler TypeScript
RUN npm run build

# Étape 2 : Image finale sans devDependencies
FROM node:18-alpine

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY package*.json ./
RUN npm install --only=production

# Copier les fichiers compilés
COPY --from=builder /app/dist ./dist
COPY .env.production ./

# Exposer le port
EXPOSE 2025

# Démarrage
CMD ["node", "dist/server-api.js"]
