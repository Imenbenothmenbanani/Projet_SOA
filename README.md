🧑‍💻 Working Space Reservation - Microservices Project

Ce projet est une application de réservation d'espaces de travail (working spaces) développée selon une architecture microservices. Les services interagissent via gRPC, GraphQL, et REST, orchestrés grâce à Docker et Docker Compose.
---
🛠️ Technologies Utilisées
Node.js : Environnement d'exécution JavaScript côté serveur.

Express : Framework léger pour créer des API REST.

Apollo Server : Serveur GraphQL pour exposer les fonctionnalités à travers une API unifiée.

gRPC : Communication rapide et structurée entre microservices via Protocol Buffers.

Protocol Buffers (.proto) : Définition des messages et services pour gRPC.

Docker : Conteneurisation des différents services.

Docker Compose : Lancement et gestion de tous les services en un clic.

----
🏗️ Architecture des Microservices
1. salle-service
Gère la gestion des salles de travail disponibles.

✅ Création de salle

✅ Consultation d'une salle par ID

✅ Liste de toutes les salles

✅ Réservation d'une salle

Communication : gRPC
Port : 50051

--- 
2. client-service
Gère l'enregistrement, la mise à jour et la consultation des clients.

✅ Inscription client

✅ Modification/Suppression

✅ Récupération par ID

Communication : gRPC
Port : 50052

-----
3. apiGateway
Fait le lien entre le client (frontend) et les microservices via :

✅ API REST

✅ API GraphQL

✅ Sécurité & centralisation des appels

Communication : gRPC vers les services
Ports : 3000 (REST & GraphQL)
