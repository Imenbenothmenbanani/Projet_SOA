const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const cors = require('cors');

// Chargement des fichiers proto
const clientProtoPath = 'client.proto';
const salleProtoPath = 'salle.proto';

const clientProtoDefinition = protoLoader.loadSync(clientProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const salleProtoDefinition = protoLoader.loadSync(salleProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const clientProto = grpc.loadPackageDefinition(clientProtoDefinition).client;
const salleProto = grpc.loadPackageDefinition(salleProtoDefinition).salle;

// Création des clients gRPC
const clientService = new clientProto.ClientService(
  'localhost:50053',
  grpc.credentials.createInsecure()
);

const salleService = new salleProto.SalleService(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

// Configuration du serveur Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Création de l'application Express
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Middleware CORS
app.use(cors());

// Middleware pour la gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Démarrage du serveur
async function startServer() {
  await server.start();
  
  app.use('/graphql', expressMiddleware(server, {
    context: async () => ({
      clientService,
      salleService,
    }),
  }));

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(err => {
  console.error('Error starting server:', err);
});
