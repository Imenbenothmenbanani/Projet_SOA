const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Chemins des fichiers .proto
const salleProtoPath = 'salle.proto';
const clientProtoPath = 'client.proto';

// Resolvers et typeDefs GraphQL
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Chargement des définitions .proto
const salleProtoDefinition = protoLoader.loadSync(salleProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const clientProtoDefinition = protoLoader.loadSync(clientProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Chargement des services gRPC
const salleProto = grpc.loadPackageDefinition(salleProtoDefinition).salle;
const clientProto = grpc.loadPackageDefinition(clientProtoDefinition).client;

const salleService = new salleProto.SalleService('salle-service:50052', grpc.credentials.createInsecure());
const clientService = new clientProto.ClientService('client-service:50053', grpc.credentials.createInsecure());

// Initialisation Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
  app.use(expressMiddleware(server));
});

// REST endpoints pour salles
app.get('/salles', (req, res) => {
  salleService.searchSalles({}, (err, response) => {
    if (err) return res.status(500).send(err);
    res.json(response.salles);
  });
});

app.post('/salle', (req, res) => {
    const { id, name, capacity, localisation } = req.body;
    
    salleService.createSalle(
      {
        id: id,
        nom: name,
        capacite: capacity,
        localisation: localisation || 'Inconnue',
        disponible: true // si requis
      },
      (err, response) => {
        if (err) return res.status(500).send(err);
        res.json(response.salle);
      }
    );
  });
  
// Ajout de l'endpoint pour mettre à jour une salle
app.put('/salles/:id', (req, res) => {
  const id = req.params.id;
  const { name, capacity, localisation, disponible } = req.body;
  
  salleService.updateSalle(
    {
      id: id,
      nom: name,
      capacite: capacity,
      localisation: localisation,
      disponible: disponible
    },
    (err, response) => {
      if (err) return res.status(500).send(err);
      res.json(response.salle);
    }
  );
});

app.get('/salles/:id', (req, res) => {
  const id = req.params.id;
  salleService.getSalle({ salle_id: id }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.json(response.salle);
  });
});

// REST endpoints pour clients
app.get('/clients', (req, res) => {
  clientService.searchClients({}, (err, response) => {
    if (err) return res.status(500).send(err);
    res.json(response.clients);
  });
});

// Ajout de l'endpoint pour créer un client
app.post('/client', (req, res) => {
  const { id, nom, email, telephone } = req.body;
  
  clientService.createClient(
    {
      id: id,
      nom: nom,
      email: email,
      telephone: telephone
    },
    (err, response) => {
      if (err) return res.status(500).send(err);
      res.json(response.client);
    }
  );
});

// Ajout de l'endpoint pour mettre à jour un client
app.put('/clients/:id', (req, res) => {
  const id = req.params.id;
  const { nom, email, telephone } = req.body;
  
  clientService.updateClient(
    {
      id: id,
      nom: nom,
      email: email,
      telephone: telephone
    },
    (err, response) => {
      if (err) return res.status(500).send(err);
      res.json(response.client);
    }
  );
});

app.get('/clients/:id', (req, res) => {
  const id = req.params.id;
  clientService.getClient({ client_id: id }, (err, response) => {
    if (err) return res.status(500).send(err);
    res.json(response.client);
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
