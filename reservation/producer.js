const { Kafka } = require('kafkajs');

// Configuration du client Kafka
const kafka = new Kafka({
  clientId: 'reservation-service', // Nom du microservice
  brokers: ['localhost:9092'] // Mets 'localhost' si tu testes en local
  // Si tu es en Docker : 'kafka:9092'
});

const producer = kafka.producer();

// Connexion du producteur Kafka
const connect = async () => {
  try {
    await producer.connect();
    console.log('✅ Kafka producer connecté (reservation-service)');
  } catch (err) {
    console.error('❌ Erreur de connexion au Kafka producer :', err);
  }
};

// Envoi d'un événement de réservation
const sendReservationEvent = async (event) => {
  try {
    await producer.send({
      topic: 'reservation-events',
      messages: [
        {
          key: event.reservation?.id || null, // Ajout d'une clé facultative
          value: JSON.stringify(event),
        }
      ]
    });
    console.log('📨 Événement envoyé à Kafka :', event);
  } catch (err) {
    console.error('❌ Erreur lors de l\'envoi à Kafka :', err);
  }
};

module.exports = {
  connect,
  sendReservationEvent
};
