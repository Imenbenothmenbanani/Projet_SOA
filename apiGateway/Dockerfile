FROM node:18-alpine

# Créer un dossier de travail
WORKDIR /usr/src/app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers (dont les protos si besoin)
COPY . .

# Exposer le port du microservice (modifie si nécessaire)
EXPOSE 3000

# Définir les variables d'environnement (remplace par ta NOUVELLE clé)
ENV OPENROUTER_API_KEY="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"
ENV HTTP_REFERER="http://localhost:3000"
ENV X_TITLE="Working Space Microservices App"

# Lancer le microservice LLM (modifie selon ton fichier d'entrée)
CMD ["node", "apiGetway.js"]
