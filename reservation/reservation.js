const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { v4: uuidv4 } = require('uuid');
const { connect, sendReservationEvent } = require('./producer'); // Pour Kafka

const reservations = []; // Base de données temporaire (en mémoire)

const reservationProtoPath = 'reservation.proto';
const reservationProtoDefinition = protoLoader.loadSync(reservationProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const reservationProto = grpc.loadPackageDefinition(reservationProtoDefinition).reservation;

// ✅ Connexion Kafka
connect();

const reservationService = {
  CreateReservation: async (call, callback) => {
    const { clientId, salleId, date } = call.request;

    const reservation = {
      id: uuidv4(),
      clientId,
      salleId,
      date,
    };

    reservations.push(reservation);
    console.log('✅ Réservation créée :', reservation);

    // ✅ Envoi de l'événement à Kafka
    await sendReservationEvent({
      type: 'CREATED',
      reservation,
    });

    callback(null, reservation);
  },

  GetReservationById: (call, callback) => {
    const { id } = call.request;
    const reservation = reservations.find(r => r.id === id);

    if (!reservation) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Réservation non trouvée',
      });
    }

    callback(null, reservation);
  },

  GetReservationsByClient: (call, callback) => {
    const { clientId } = call.request;
    const clientReservations = reservations.filter(r => r.clientId === clientId);

    callback(null, { reservations: clientReservations });
  },

  CancelReservation: async (call, callback) => {
    const { id } = call.request;
    const index = reservations.findIndex(r => r.id === id);

    if (index === -1) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: 'Réservation non trouvée',
      });
    }

    const [deleted] = reservations.splice(index, 1);
    console.log(`❌ Réservation ${id} annulée`);

    // ✅ Envoi à Kafka (optionnel)
    await sendReservationEvent({
      type: 'CANCELLED',
      reservation: deleted,
    });

    callback(null, { message: 'Réservation annulée avec succès' });
  },
};

const server = new grpc.Server();
server.addService(reservationProto.ReservationService.service, reservationService);

const PORT = 50053;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('❌ Erreur de démarrage du service de réservation :', err);
    return;
  }
  console.log(`🚀 Service de réservation en cours sur le port ${port}`);
});
