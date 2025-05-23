const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: ['kafka:9092']
});

const producer = kafka.producer();

const sendWelcomeMessage = async (user) => {
  try {
    await producer.connect();
    console.log('Producer connecté.');

    await producer.send({
      topic: 'user-login',
      messages: [
        { value: `Welcome ${user.name}!` }
      ],
    });

    console.log(`Message envoyé: Welcome ${user.name}!`);

    await producer.disconnect();
    console.log('Producer déconnecté.');
  } catch (error) {
    console.error('Erreur lors de l’envoi du message Kafka:', error);
  }
};

module.exports = sendWelcomeMessage;
