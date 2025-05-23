const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'notification-service',  // Identifiant de ton service Kafka
  brokers: ['kafka:9092'],            // Adresse de ton broker Kafka (docker-compose ou localhost)
});

const consumer = kafka.consumer({ groupId: 'login-group' });  // Groupe de consommateurs

const run = async () => {
  try {
    await consumer.connect();
    console.log('Consumer connecté.');

    await consumer.subscribe({ topic: 'user-login', fromBeginning: true });
    console.log('Abonné au topic "user-login".');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`Message reçu sur ${topic}[partition ${partition}]: ${message.value.toString()}`);
        // Ici tu peux ajouter la logique métier pour traiter le message
      },
    });

  } catch (error) {
    console.error('Erreur dans le consumer Kafka:', error);
  }
};

run();
