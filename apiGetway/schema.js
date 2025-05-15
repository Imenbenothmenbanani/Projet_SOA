const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  type Salle {
    id: String!
    name: String!
    capacity: Int!
    localisation: String!
  }

  type Client {
    id: String!
    fullName: String
    email: String!
  }

  type Query {
    salle(id: String!): Salle
    salles: [Salle]
    client(id: String!): Client
    clients: [Client]
  }

  type Mutation {
    createSalle(id: String!, name: String!, capacity: Int!, localisation: String!): Salle
    createClient(id: String!, fullName: String!, email: String!): Client
  }
`;

module.exports = typeDefs;
/// -> postman->(rest)
///graphql-> (pool)