# Utilise une image Node.js légère
FROM node:18-alpine

# Crée un dossier de travail dans le conteneur
WORKDIR /usr/src/app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste du projet
COPY . .

# Expose le port sur lequel l'API Gateway écoute
EXPOSE 3000

# Commande de démarrage de l'application
CMD ["node", "apiGetway.js"]
