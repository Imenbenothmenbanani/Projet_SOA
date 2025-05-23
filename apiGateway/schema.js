const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  scalar Date

  type Reservation {
    id: String!
    salle_id: String!
    client_id: String!
    date: Date!
    heure_debut: String!
    heure_fin: String!
  }

  type Salle {
    id: String!
    name: String!
    capacity: Int!
    localisation: String!
    disponible: Boolean!
    reservations: [Reservation]
  }

  type Client {
    id: ID!
    nom: String!
    email: String!
  }

  input CreateClientInput {
    id: ID!
    nom: String!
    email: String!
    password: String!
  }

  input UpdateClientInput {
    id: ID!
    nom: String
    email: String
    password: String
  }

  input CreateSalleInput {
    id: String!
    name: String!
    capacity: Int!
    localisation: String!
    disponible: Boolean!
  }

  input UpdateSalleInput {
    id: String!
    name: String
    capacity: Int
    localisation: String
    disponible: Boolean
  }

  input CreateReservationInput {
    salle_id: String!
    client_id: String!
    date: Date!
    heure_debut: String!
    heure_fin: String!
  }

  input UpdateReservationInput {
    id: String!
    salle_id: String
    client_id: String
    date: Date
    heure_debut: String
    heure_fin: String
  }

  input SearchSalleInput {
    query: String
    minCapacity: Int
    maxCapacity: Int
    localisation: String
    disponible: Boolean
  }

  type Query {
    getSalle(id: String!): Salle
    getAllSalles: [Salle]
    searchSalles(input: SearchSalleInput): [Salle]
    getSalleReservations(salle_id: String!): [Reservation]
    getClientReservations(client_id: String!): [Reservation]
    getReservation(id: String!): Reservation
    checkSalleDisponibilite(salle_id: String!, date: Date!, heure_debut: String!, heure_fin: String!): Boolean
    getClient(id: ID!): Client
    searchClients(query: String!): [Client]
  }

  type Mutation {
    # Salle mutations
    createSalle(input: CreateSalleInput!): Salle
    updateSalle(input: UpdateSalleInput!): Salle
    deleteSalle(id: String!): Boolean
    
    # Reservation mutations
    createReservation(input: CreateReservationInput!): Reservation
    updateReservation(input: UpdateReservationInput!): Reservation
    deleteReservation(id: String!): Boolean
    reserverSalle(salle_id: String!, client_id: String!, date: Date!, heure_debut: String!, heure_fin: String!): Boolean
    
    # Client mutations
    createClient(input: CreateClientInput!): Client
    updateClient(input: UpdateClientInput!): Client
    deleteClient(id: ID!): Boolean
    authenticate(email: String!, password: String!): Client
  }
`;

module.exports = typeDefs;
/// -> postman->(rest)
///graphql-> (pool)