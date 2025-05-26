# 🤖 LLM Client + Formulaire de Réservation

Ce projet est une interface simple regroupant :

- Un **formulaire de réservation** pour hôtels/chambres.
- Un **microservice LLM (Language Model)** permettant d’interagir avec un agent IA à partir d’un prompt texte et d’une image.

Le tout est conçu pour s'intégrer dans une architecture microservices, communiquant via **HTTP/REST**.

---

## 🛠️ Technologies Utilisées

- **Node.js / Express** : Création d’APIs REST.
- **gRPC** : Communication performante entre microservices.
- **Apache Kafka** : Bus de messages pour communication asynchrone.
- **Docker / Docker Compose** : Conteneurisation et orchestration.
- **LLM (OpenRouter)** : Intégration d’un agent IA (version simulée pour l’instant).

---

## ⚙️ Architecture des Services

| Service             | Description                                                                                               | Port         |
|---------------------|-----------------------------------------------------------------------------------------------------------|--------------|
| **api-gateway**     | Point d'entrée pour tous les appels REST & gRPC vers les microservices. Gère aussi l'authentification.    | `3000`       |
| **client**          | Microservice de gestion des clients. Création, récupération, suppression, etc.                            | `50053`      |
| **reservation**     | Gère les réservations d'hôtel (ajout, annulation, consultation).                                          | `50054`      |
| **salle**           | Gère les informations des salles/chambres disponibles.                                                    | `50052`      |
| **kafka**           | Broker Kafka pour la messagerie inter-service.                                                            | `9092`       |
| **zookeeper**       | Coordination pour Kafka.                                                                                  | `2181`       |
| **kafka-consumer**  | Service consommateur Kafka (écoute les événements envoyés par d'autres microservices).                    | —            |

---

## 📂 Structure des Dossiers
## 📦 Architecture du Projet

### 1. `client (Frontend)`

Interface utilisateur dans `public/index.html` :

- ✅ Saisie des informations de réservation
- ✅ Saisie d’un prompt et d’un lien image
- ✅ Appels API vers `/chat`
- ✅ Affichage JSON de la réponse IA

### 2. `server (Backend)`

Serveur Node.js via Express (`server.js`) :

- ✅ Route `POST /chat` pour traiter le prompt & image
- ✅ Simulation de réponse IA
- ❌ Pas de base de données (stateless)
- Port : `3002`

---

## 🧪 Fonctionnalités Clés

### 🎯 Formulaire de Réservation

- Nom, Prénom
- Numéro de chambre
- Date de début / fin
- Affichage en console (non stocké)

### 🤖 Microservice LLM

- Route `POST /chat` :
  - Entrée : `{ prompt, imageUrl }`
  - Réponse simulée (pour l’instant)
- Intégration future possible avec une API LLM réelle (ex. OpenRouter, OpenAI)

---

## 💻 Installation & Lancement

### Prérequis

- Node.js v18+
- Navigateur Web

### Étapes

```bash
# 1. Cloner le projet
git clone https://github.com/Imenbenothmenbanani/Projet_SOA.git
cd Projet_SOA.git

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur
node server.js
