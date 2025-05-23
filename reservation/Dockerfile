# Utilise une image légère Node.js
FROM node:18-alpine

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie de tous les fichiers du projet
COPY . .

# Port exposé pour le service gRPC
EXPOSE 50054

# Commande de lancement du microservice
CMD ["node", "src/reservation.js"]
