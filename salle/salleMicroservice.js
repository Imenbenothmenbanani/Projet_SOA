const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger le fichier salle.proto
const salleProtoPath = 'salle.proto';
const salleProtoDefinition = protoLoader.loadSync(salleProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const salleProto = grpc.loadPackageDefinition(salleProtoDefinition).salle;  // Access the correct namespace

// Simuler une base de données en mémoire
const salles = [
  { id: '1', nom: 'Salle A', capacite: 10, localisation: 'Tunis', disponible: true },
  { id: '2', nom: 'Salle B', capacite: 20, localisation: 'Sousse', disponible: true },
];

// Définir les méthodes du service
const salleService = {
  getSalle: (call, callback) => {
    const salle = salles.find(s => s.id === call.request.salle_id);
    if (!salle) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Salle non trouvée' });
    }
    callback(null, { salle });
  },

  searchSalles: (call, callback) => {
    const { query } = call.request;
    const filtered = salles.filter(s =>
      s.nom.toLowerCase().includes(query.toLowerCase()) ||
      s.localisation.toLowerCase().includes(query.toLowerCase())
    );
    callback(null, { salles: filtered });
  },

  createSalle: (call, callback) => {
    const { id, nom, capacite, localisation } = call.request;
    const salle = { id, nom, capacite, localisation, disponible: true };
    salles.push(salle);
    callback(null, { salle });
  },

  reserverSalle: (call, callback) => {
    const { salle_id, client_id, date, heure_debut, heure_fin } = call.request;
    const salle = salles.find(s => s.id === salle_id);

    if (!salle || !salle.disponible) {
      return callback(null, {
        success: false,
        message: 'Salle non disponible ou inexistante',
      });
    }

    // On la rend indisponible (simulation)
    salle.disponible = false;

    callback(null, {
      success: true,
      message: `Réservation confirmée pour la salle ${salle.nom} le ${date} de ${heure_debut} à ${heure_fin}`,
    });
  },
};

// Lancer le serveur gRPC
const server = new grpc.Server();
server.addService(salleProto.SalleService.service, salleService);

const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Erreur de lancement du serveur :', err);
    return;
  }
  console.log(`Salle microservice en écoute sur le port ${port}`);
});
