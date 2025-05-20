const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const bcrypt = require('bcryptjs');

// Charger le fichier client.proto
const clientProtoPath = 'client.proto';
const clientProtoDefinition = protoLoader.loadSync(clientProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const clientProto = grpc.loadPackageDefinition(clientProtoDefinition).client;

// Exemple de clients en mémoire avec mots de passe hachés
const clients = [
  { 
    id: '1', 
    nom: 'imen', 
    email: 'imen@gmail.com',
    password: 'password123' // Mot de passe haché
  },
  { 
    id: '2', 
    nom: 'Sana', 
    email: 'sana@gmail.com',
    password: 'password123' // Mot de passe haché
  }
];

// Stockage des réservations des clients
const reservations = [];

// Définir les méthodes du service
const clientService = {
  // Obtenir un client par son ID
  getClient: (call, callback) => {
    const client = clients.find(c => c.id === call.request.client_id);
    if (!client) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Client non trouvé' });
    }
    // Ne pas renvoyer le mot de passe
    const { password, ...clientWithoutPassword } = client;
    callback(null, { client: clientWithoutPassword });
  },

  // Rechercher des clients
  searchClients: (call, callback) => {
    const { query } = call.request;
    const filtered = clients.filter(c =>
      c.nom.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
    );
    // Ne pas renvoyer les mots de passe
    const clientsWithoutPasswords = filtered.map(({ password, ...client }) => client);
    callback(null, { clients: clientsWithoutPasswords });
  },

  // Créer un nouveau client
  createClient: async (call, callback) => {
    const { id, nom, email, password } = call.request;
    
    // Vérifier si l'email existe déjà
    if (clients.some(c => c.email === email)) {
      return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Email déjà utilisé' });
    }

    try {
      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      const newClient = { id, nom, email, password: hashedPassword };
      clients.push(newClient);
      
      // Ne pas renvoyer le mot de passe
      const { password: _, ...clientWithoutPassword } = newClient;
      callback(null, { client: clientWithoutPassword });
    } catch (error) {
      callback({ code: grpc.status.INTERNAL, message: 'Erreur lors de la création du client' });
    }
  },

  // Mettre à jour un client existant
  updateClient: async (call, callback) => {
    const { id, nom, email, password } = call.request;
    const clientIndex = clients.findIndex(c => c.id === id);

    if (clientIndex === -1) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Client non trouvé' });
    }

    // Vérifier si le nouvel email est déjà utilisé par un autre client
    if (email && email !== clients[clientIndex].email) {
      if (clients.some(c => c.email === email)) {
        return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Email déjà utilisé' });
      }
    }

    try {
      const updatedClient = { ...clients[clientIndex] };
      
      if (nom) updatedClient.nom = nom;
      if (email) updatedClient.email = email;
      if (password) {
        updatedClient.password = await bcrypt.hash(password, 10);
      }

      clients[clientIndex] = updatedClient;
      
      // Ne pas renvoyer le mot de passe
      const { password: _, ...clientWithoutPassword } = updatedClient;
      callback(null, { client: clientWithoutPassword });
    } catch (error) {
      callback({ code: grpc.status.INTERNAL, message: 'Erreur lors de la mise à jour du client' });
    }
  },

  // Supprimer un client
  deleteClient: (call, callback) => {
    const { client_id } = call.request;
    const clientIndex = clients.findIndex(c => c.id === client_id);

    if (clientIndex === -1) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Client non trouvé' });
    }

    // Vérifier si le client a des réservations
    const hasReservations = reservations.some(r => r.client_id === client_id);
    if (hasReservations) {
      return callback({ 
        code: grpc.status.FAILED_PRECONDITION, 
        message: 'Impossible de supprimer un client avec des réservations' 
      });
    }

    try {
      clients.splice(clientIndex, 1);
      callback(null, { success: true });
    } catch (error) {
      callback({ code: grpc.status.INTERNAL, message: 'Erreur lors de la suppression du client' });
    }
  },

  // Authentifier un client
  authenticate: async (call, callback) => {
    const { email, password } = call.request;
    const client = clients.find(c => c.email === email);

    if (!client) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Client non trouvé' });
    }

    try {
      const isValid = await bcrypt.compare(password, client.password);
      if (!isValid) {
        return callback({ code: grpc.status.UNAUTHENTICATED, message: 'Mot de passe incorrect' });
      }

      // Ne pas renvoyer le mot de passe
      const { password: _, ...clientWithoutPassword } = client;
      callback(null, { client: clientWithoutPassword });
    } catch (error) {
      callback({ code: grpc.status.INTERNAL, message: 'Erreur lors de l\'authentification' });
    }
  },

  // Obtenir les réservations d'un client
  getClientReservations: (call, callback) => {
    const { client_id } = call.request;
    const client = clients.find(c => c.id === client_id);

    if (!client) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Client non trouvé' });
    }

    const clientReservations = reservations.filter(r => r.client_id === client_id);
    callback(null, { reservations: clientReservations });
  }
};

// Créer et lancer le serveur gRPC
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
