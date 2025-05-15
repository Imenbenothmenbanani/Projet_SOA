const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Chargement des .proto
const salleProtoPath = './salle.proto';
const clientProtoPath = './client.proto';

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

const salleProto = grpc.loadPackageDefinition(salleProtoDefinition).salle;
const clientProto = grpc.loadPackageDefinition(clientProtoDefinition).client;

const salleService = new salleProto.SalleService('salle-service:50052', grpc.credentials.createInsecure());
const clientService = new clientProto.ClientService('client-service:50053', grpc.credentials.createInsecure());

const resolvers = {
  Query: {
    salle: (_, { id }) => {
      return new Promise((resolve, reject) => {
        salleService.getSalle({ salle_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.salle);
        });
      });
    },
    salles: () => {
      return new Promise((resolve, reject) => {
        salleService.searchSalles({}, (err, response) => {
          if (err) reject(err);
          else resolve(response.salles);
        });
      });
    },
    client: (_, { id }) => {
      return new Promise((resolve, reject) => {
        clientService.getClient({ client_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.client);
        });
      });
    },
    clients: () => {
      return new Promise((resolve, reject) => {
        clientService.searchClients({}, (err, response) => {
          if (err) reject(err);
          else resolve(response.clients);
        });
      });
    },
  },
  Mutation: {
    createSalle: (_, { id, name, capacity, localisation }) => {
      return new Promise((resolve, reject) => {
        salleService.createSalle({ 
          id: id, 
          nom: name,
          capacite: capacity, 
          localisation: localisation 
        }, (err, response) => {
          if (err) reject(err);
          else resolve(response.salle);
        });
      });
    },
    createClient: (_, { id, fullName, email }) => {
      return new Promise((resolve, reject) => {
        clientService.createClient({ id, fullName, email }, (err, response) => {
          if (err) reject(err);
          else resolve(response.client);
        });
      });
    },
  },
};

module.exports = resolvers;
