const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

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

const salleService = new salleProto.SalleService('localhost:50052', grpc.credentials.createInsecure());
const clientService = new clientProto.ClientService('localhost:50053', grpc.credentials.createInsecure());


// Fonction pour transformer les données de la salle
const transformSalle = (salle) => {
  if (!salle) {
    throw new Error('Salle non trouvée');
  }
  return {
    id: salle.id || '',
    name: salle.nom || '',
    capacity: salle.capacite || 0,
    localisation: salle.localisation || '',
    disponible: salle.disponible !== undefined ? salle.disponible : true
  };
};

const resolvers = {
  Query: {
    getSalle: (_, { id }) => {
      return new Promise((resolve, reject) => {
        salleService.getSalle({ salle_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(transformSalle(response.salle));
        });
      });
    },
    getAllSalles: () => {
      return new Promise((resolve, reject) => {
        salleService.searchSalles({}, (err, response) => {
          if (err) reject(err);
          else {
            try {
              const transformedSalles = response.salles.map(transformSalle);
              resolve(transformedSalles);
            } catch (error) {
              reject(error);
            }
          }
        });
      });
    },
    searchSalles: (_, { input }) => {
      return new Promise((resolve, reject) => {
        const searchParams = {
          query: input?.query || '',
          minCapacity: input?.minCapacity,
          maxCapacity: input?.maxCapacity,
          localisation: input?.localisation,
          disponible: input?.disponible
        };
        salleService.searchSalles(searchParams, (err, response) => {
          if (err) reject(err);
          else {
            try {
              const transformedSalles = response.salles.map(transformSalle);
              resolve(transformedSalles);
            } catch (error) {
              reject(error);
            }
          }
        });
      });
    },
    getSalleReservations: (_, { salle_id }) => {
      return new Promise((resolve, reject) => {
        salleService.GetSalleReservations({ salle_id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.reservations);
        });
      });
    },
    checkSalleDisponibilite: async (_, { salle_id, date, heure_debut, heure_fin }) => {
      return new Promise((resolve, reject) => {
        salleService.CheckDisponibilite(
          { salle_id, date, heure_debut, heure_fin },
          (err, response) => {
            if (err) {
              console.error('Erreur gRPC :', err);
              reject(new GraphQLError("Erreur lors de la vérification de la disponibilité."));
            } else {
              resolve(response.disponible); // ou response.result selon votre .proto
            }
          }
        );
      });
    },
    
    getClient: async (_, { id }, { clientService }) => {
      return new Promise((resolve, reject) => {
        clientService.getClient({ client_id: id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.client);
          }
        });
      });
    },
    searchClients: async (_, { query }, { clientService }) => {
      return new Promise((resolve, reject) => {
        clientService.searchClients({ query }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.clients);
          }
        });
      });
    },
    getReservation: (_, { id }) => {
      return new Promise((resolve, reject) => {
        salleService.getReservation({ reservation_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.reservation);
        });
      });
    },
    getClientReservations: (_, { client_id }) => {
      return new Promise((resolve, reject) => {
        salleService.getClientReservations({ client_id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.reservations);
        });
      });
    },
  },
  Mutation: {
    createSalle: (_, { input }) => {
      const salleInput = {
        id: input.id,
        nom: input.name,
        capacite: input.capacity,
        localisation: input.localisation,
        disponible: input.disponible
      };
      return new Promise((resolve, reject) => {
        salleService.createSalle(salleInput, (err, response) => {
          if (err) reject(err);
          else resolve(transformSalle(response.salle));
        });
      });
    },
    updateSalle: (_, { input }) => {
      const salleInput = {
        id: input.id,
        nom: input.name,
        capacite: input.capacity,
        localisation: input.localisation,
        disponible: input.disponible
      };
      return new Promise((resolve, reject) => {
        salleService.updateSalle(salleInput, (err, response) => {
          if (err) reject(err);
          else resolve(transformSalle(response.salle));
        });
      });
    },
    deleteSalle: (_, { id }) => {
      return new Promise((resolve, reject) => {
        salleService.deleteSalle({ salle_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.success);
        });
      });
    },
    reserverSalle: (_, { salle_id, client_id, date, heure_debut, heure_fin }) => {
      return new Promise((resolve, reject) => {
        salleService.reserverSalle({
          salle_id,
          client_id,
          date,
          heure_debut,
          heure_fin
        }, (err, response) => {
          if (err) reject(err);
          else resolve(response.success);
        });
      });
    },
    createClient: async (_, { input }, { clientService }) => {
      return new Promise((resolve, reject) => {
        clientService.createClient(input, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.client);
          }
        });
      });
    },
    updateClient: async (_, { input }, { clientService }) => {
      return new Promise((resolve, reject) => {
        clientService.updateClient(input, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.client);
          }
        });
      });
    },
    deleteClient: async (_, { id }, { clientService }) => {
      return new Promise((resolve, reject) => {
        clientService.deleteClient({ client_id: id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.success);
          }
        });
      });
    },
    authenticate: async (_, { email, password }, { clientService }) => {
      return new Promise((resolve, reject) => {
        clientService.authenticate({ email, password }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response.client);
          }
        });
      });
    },
    createReservation: (_, { input }) => {
      return new Promise((resolve, reject) => {
        salleService.reserverSalle({
          salle_id: input.salle_id,
          client_id: input.client_id,
          date: input.date,
          heure_debut: input.heure_debut,
          heure_fin: input.heure_fin
        }, (err, response) => {
          if (err) reject(err);
          else {
            if (!input.salle_id || !input.client_id || !input.date || !input.heure_debut || !input.heure_fin) {
              reject(new Error('Un des champs requis est manquant dans createReservation'));
            }
    
            const reservation = {
              id: response.reservation_id || Date.now().toString(),  // idéalement réponse du gRPC
              salle_id: input.salle_id,
              client_id: input.client_id,
              date: input.date,
              heure_debut: input.heure_debut,
              heure_fin: input.heure_fin
            };
            resolve(reservation);
          }
        });
      });
    },
    
    
    updateReservation: (_, { input }) => {
      return new Promise((resolve, reject) => {
        // D'abord supprimer l'ancienne réservation
        salleService.deleteReservation({ reservation_id: input.id }, (err, response) => {
          if (err) {
            reject(err);
          } else {
            // Ensuite créer une nouvelle réservation
            salleService.reserverSalle({
              salle_id: input.salle_id || input.id,
              client_id: input.client_id,
              date: input.date,
              heure_debut: input.heure_debut,
              heure_fin: input.heure_fin
            }, (err, response) => {
              if (err) reject(err);
              else {
                const reservation = {
                  id: input.id,
                  salle_id: input.salle_id || input.id,
                  client_id: input.client_id,
                  date: input.date,
                  heure_debut: input.heure_debut,
                  heure_fin: input.heure_fin
                };
                resolve(reservation);
              }
            });
          }
        });
      });
    },
    deleteReservation: (_, { id }) => {
      return new Promise((resolve, reject) => {
        salleService.deleteReservation({ reservation_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.success);
        });
      });
    },
  },
  Salle: {
    reservations: (parent) => {
      return new Promise((resolve, reject) => {
        salleService.getSalleReservations({ salle_id: parent.id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.reservations);
        });
      });
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.toISOString();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};

module.exports = resolvers;
