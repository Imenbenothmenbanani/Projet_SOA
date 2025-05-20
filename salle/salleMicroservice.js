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
const salleProto = grpc.loadPackageDefinition(salleProtoDefinition).salle;

// Exemple de salles en mémoire
const salles = [
  {
    id: '1',
    nom: 'Salle A',
    capacite: 50,
    localisation: 'Étage 1',
    disponible: true
  },
  {
    id: '2',
    nom: 'Salle B',
    capacite: 30,
    localisation: 'Étage 2',
    disponible: true
  }
];

// Stockage des réservations
const reservations = [];

// Définir les méthodes du service
const salleService = {
  // Obtenir une salle par son ID
  getSalle: (call, callback) => {
    const salle = salles.find(s => s.id === call.request.salle_id);
    if (!salle) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Salle non trouvée' });
    }
    callback(null, { salle });
  },

  // Rechercher des salles
  searchSalles: (call, callback) => {
    const { query } = call.request;
    let filtered = salles;
    
    if (query && query.trim() !== '') {
      const searchQuery = query.toLowerCase().trim();
      filtered = salles.filter(s =>
        s.nom.toLowerCase().includes(searchQuery) ||
        s.localisation.toLowerCase().includes(searchQuery)
      );
    }
    
    callback(null, { salles: filtered });
  },

  // Créer une nouvelle salle
  createSalle: (call, callback) => {
    const { id, nom, capacite, localisation, disponible } = call.request;
    
    // Vérifier si l'ID existe déjà
    if (salles.some(s => s.id === id)) {
      return callback({ code: grpc.status.ALREADY_EXISTS, message: 'ID de salle déjà utilisé' });
    }

    const newSalle = {
      id,
      nom,
      capacite,
      localisation,
      disponible: disponible !== undefined ? disponible : true
    };

    salles.push(newSalle);
    callback(null, { salle: newSalle });
  },

  // Mettre à jour une salle existante
  updateSalle: (call, callback) => {
    const { id, nom, capacite, localisation, disponible } = call.request;
    const salleIndex = salles.findIndex(s => s.id === id);

    if (salleIndex === -1) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Salle non trouvée' });
    }

    try {
      const updatedSalle = { ...salles[salleIndex] };
      
      if (nom) updatedSalle.nom = nom;
      if (capacite) updatedSalle.capacite = capacite;
      if (localisation) updatedSalle.localisation = localisation;
      if (disponible !== undefined) updatedSalle.disponible = disponible;

      salles[salleIndex] = updatedSalle;
      callback(null, { salle: updatedSalle });
    } catch (error) {
      callback({ code: grpc.status.INTERNAL, message: 'Erreur lors de la mise à jour de la salle' });
    }
  },

  // Supprimer une salle
  deleteSalle: (call, callback) => {
    const { salle_id } = call.request;
    const salleIndex = salles.findIndex(s => s.id === salle_id);

    if (salleIndex === -1) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Salle non trouvée' });
    }

    // Vérifier si la salle a des réservations
    const hasReservations = reservations.some(r => r.salle_id === salle_id);
    if (hasReservations) {
      return callback({ 
        code: grpc.status.FAILED_PRECONDITION, 
        message: 'Impossible de supprimer une salle avec des réservations' 
      });
    }

    try {
      salles.splice(salleIndex, 1);
      callback(null, { success: true });
    } catch (error) {
      callback({ code: grpc.status.INTERNAL, message: 'Erreur lors de la suppression de la salle' });
    }
  },

  // Réserver une salle
  reserverSalle: (call, callback) => {
    const { salle_id, client_id, date, heure_debut, heure_fin } = call.request;

    // Vérifier si la salle existe
    const salle = salles.find(s => s.id === salle_id);
    if (!salle) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Salle non trouvée' });
    }

    // Vérifier si la salle est disponible
    if (!salle.disponible) {
      return callback({ 
        code: grpc.status.FAILED_PRECONDITION, 
        message: 'La salle n\'est pas disponible' 
      });
    }

    // Vérifier les conflits de réservation
    const conflit = reservations.some(r => 
      r.salle_id === salle_id && 
      r.date === date && 
      ((heure_debut >= r.heure_debut && heure_debut < r.heure_fin) ||
       (heure_fin > r.heure_debut && heure_fin <= r.heure_fin))
    );

    if (conflit) {
      return callback({ 
        code: grpc.status.ALREADY_EXISTS, 
        message: 'La salle est déjà réservée pour cette période' 
      });
    }

    try {
      // Créer la réservation
      const reservation = {
        salle_id,
        client_id,
        date,
        heure_debut,
        heure_fin
      };
      reservations.push(reservation);

      callback(null, { 
        success: true, 
        message: 'Réservation effectuée avec succès' 
      });
    } catch (error) {
      callback({ 
        code: grpc.status.INTERNAL, 
        message: 'Erreur lors de la réservation de la salle' 
      });
    }
  },

  // Créer une nouvelle réservation
  createReservation: (call, callback) => {
    const { salle_id, client_id, date, heure_debut, heure_fin } = call.request;

    // Vérifier si la salle existe
    const salle = salles.find(s => s.id === salle_id);
    if (!salle) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Salle non trouvée' });
    }

    // Vérifier si la salle est disponible
    if (!salle.disponible) {
      return callback({ 
        code: grpc.status.FAILED_PRECONDITION, 
        message: 'La salle n\'est pas disponible' 
      });
    }

    // Vérifier les conflits de réservation
    const conflit = reservations.some(r => 
      r.salle_id === salle_id && 
      r.date === date && 
      ((heure_debut >= r.heure_debut && heure_debut < r.heure_fin) ||
       (heure_fin > r.heure_debut && heure_fin <= r.heure_fin))
    );

    if (conflit) {
      return callback({ 
        code: grpc.status.ALREADY_EXISTS, 
        message: 'La salle est déjà réservée pour cette période' 
      });
    }

    try {
      // Créer la réservation
      const reservation = {
        id: Date.now().toString(), // Générer un ID unique
        salle_id,
        client_id,
        date,
        heure_debut,
        heure_fin
      };
      reservations.push(reservation);

      callback(null, { reservation });
    } catch (error) {
      callback({ 
        code: grpc.status.INTERNAL, 
        message: 'Erreur lors de la création de la réservation' 
      });
    }
  },

  // Mettre à jour une réservation
  updateReservation: (call, callback) => {
    const { id, salle_id, client_id, date, heure_debut, heure_fin } = call.request;
    const reservationIndex = reservations.findIndex(r => r.id === id);

    if (reservationIndex === -1) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Réservation non trouvée' });
    }

    try {
      const updatedReservation = { ...reservations[reservationIndex] };
      
      if (salle_id) updatedReservation.salle_id = salle_id;
      if (client_id) updatedReservation.client_id = client_id;
      if (date) updatedReservation.date = date;
      if (heure_debut) updatedReservation.heure_debut = heure_debut;
      if (heure_fin) updatedReservation.heure_fin = heure_fin;

      // Vérifier les conflits si la salle ou la date/heure a changé
      if (salle_id || date || heure_debut || heure_fin) {
        const conflit = reservations.some(r => 
          r.id !== id && // Exclure la réservation actuelle
          r.salle_id === (salle_id || updatedReservation.salle_id) && 
          r.date === (date || updatedReservation.date) && 
          ((heure_debut || updatedReservation.heure_debut) >= r.heure_debut && 
           (heure_debut || updatedReservation.heure_debut) < r.heure_fin ||
           (heure_fin || updatedReservation.heure_fin) > r.heure_debut && 
           (heure_fin || updatedReservation.heure_fin) <= r.heure_fin)
        );

        if (conflit) {
          return callback({ 
            code: grpc.status.ALREADY_EXISTS, 
            message: 'La salle est déjà réservée pour cette période' 
          });
        }
      }

      reservations[reservationIndex] = updatedReservation;
      callback(null, { reservation: updatedReservation });
    } catch (error) {
      callback({ 
        code: grpc.status.INTERNAL, 
        message: 'Erreur lors de la mise à jour de la réservation' 
      });
    }
  },

  // Supprimer une réservation
  deleteReservation: (call, callback) => {
    const { reservation_id } = call.request;
    const reservationIndex = reservations.findIndex(r => r.id === reservation_id);

    if (reservationIndex === -1) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Réservation non trouvée' });
    }

    try {
      reservations.splice(reservationIndex, 1);
      callback(null, { success: true });
    } catch (error) {
      callback({ 
        code: grpc.status.INTERNAL, 
        message: 'Erreur lors de la suppression de la réservation' 
      });
    }
  },

  // Obtenir une réservation par son ID
  getReservation: (call, callback) => {
    const { reservation_id } = call.request;
    const reservation = reservations.find(r => r.id === reservation_id);

    if (!reservation) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Réservation non trouvée' });
    }

    callback(null, { reservation });
  },

  // Obtenir les réservations d'une salle
  getSalleReservations: (call, callback) => {
    const { salle_id } = call.request;
    
    // Vérifier si la salle existe
    const salle = salles.find(s => s.id === salle_id);
    if (!salle) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Salle non trouvée' });
    }

    // Filtrer les réservations pour cette salle
    const salleReservations = reservations.filter(r => r.salle_id === salle_id);
    callback(null, { reservations: salleReservations });
  },

  // Obtenir les réservations d'un client
  getClientReservations: (call, callback) => {
    const { client_id } = call.request;
    const clientReservations = reservations.filter(r => r.client_id === client_id);
    callback(null, { reservations: clientReservations });
  },

  // Vérifier la disponibilité d'une salle
  checkDisponibilite: (call, callback) => {
    const { salle_id, date, heure_debut, heure_fin } = call.request;

    // Vérifier si la salle existe
    const salle = salles.find(s => s.id === salle_id);
    if (!salle) {
      return callback({ code: grpc.status.NOT_FOUND, message: 'Salle non trouvée' });
    }

    // Vérifier si la salle est disponible
    if (!salle.disponible) {
      return callback(null, { disponible: false });
    }

    // Vérifier les conflits de réservation
    const conflit = reservations.some(r => 
      r.salle_id === salle_id && 
      r.date === date && 
      ((heure_debut >= r.heure_debut && heure_debut < r.heure_fin) ||
       (heure_fin > r.heure_debut && heure_fin <= r.heure_fin))
    );

    callback(null, { disponible: !conflit });
  },

  // Obtenir toutes les salles
  getAllSalles: (call, callback) => {
    try {
      callback(null, { salles: salles });
    } catch (error) {
      callback({ 
        code: grpc.status.INTERNAL, 
        message: 'Erreur lors de la récupération des salles' 
      });
    }
  }
};

// Créer et lancer le serveur gRPC
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
