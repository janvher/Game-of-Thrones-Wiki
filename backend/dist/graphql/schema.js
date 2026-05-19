export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
    name: String!
  }

  type Character {
    id: Int!
    name: String!
    gender: String!
    culture: String!
    born: String!
    titles: [String!]!
    tvSeries: [String!]!
    playedBy: [String!]!
    imageUrl: String
    died: String
    alive: Boolean
    status: String
    aliases: [String!]
    books: [String!]
    povBooks: [String!]
  }

  type CharacterPage {
    page: Int!
    pageSize: Int!
    hasNext: Boolean!
    hasPrevious: Boolean!
    results: [Character!]!
  }

  type Favorite {
    id: ID!
    characterId: Int!
    characterName: String!
    createdAt: String!
  }

  type PageViewSummary {
    path: String!
    views: Int!
  }

  type Query {
    me: User
    characters(page: Int = 1, pageSize: Int = 9, search: String): CharacterPage!
    character(id: Int!): Character
    favorites: [Favorite!]!
    analyticsSummary: [PageViewSummary!]!
  }

  type Mutation {
    addFavorite(characterId: Int!): Favorite!
    removeFavorite(characterId: Int!): Boolean!
    trackPageView(path: String!): Boolean!
  }
`;
