const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger le fichier client.proto
const clientProtoPath = 'client.proto';
const clientProtoDefinition = protoLoader.loadSync(clientProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const clientProto = grpc.loadPackageDefinition(clientProtoDefinition).client;  // Access the correct namespace

// Exemple de clients en mémoire
const clients = [
  { id: '1', nom: 'imen', email: 'imen@gmail.com' },
  { id: '2', nom: 'Sana', email: 'sana@gmail.com' },
];

// Définir les méthodes du service
const clientService = {
  getClient: (call, callback) => {
    const client = clients.find(c => c.id === call.request.client_id);
    if (!client) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Client non trouvé' });
    }
    callback(null, { client });
  },

  searchClients: (call, callback) => {
    const { query } = call.request;
    const filtered = clients.filter(c =>
      c.nom.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
    );
    callback(null, { clients: filtered });
  },

  createClient: (call, callback) => {
    const { id, nom, email } = call.request;
    const newClient = { id, nom, email };
    clients.push(newClient);
    callback(null, { client: newClient });
  },
};

// creer et Lancer le serveur gRPC
const server = new grpc.Server();
server.addService(clientProto.ClientService.service, clientService);

const port = 50053;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Erreur de lancement du serveur :', err);
    return;
  }
  console.log(`Client microservice en écoute sur le port ${port}`);
});
