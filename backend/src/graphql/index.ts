import { createSchema, createYoga } from 'graphql-yoga';
import { config } from '../config.js';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { buildContext } from './context.js';

const schema = createSchema({
  typeDefs,
  resolvers,
});

export const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  context: async ({ request }) => {
    const authHeader = request.headers.get('authorization') ?? undefined;
    return buildContext(authHeader);
  },
  landingPage: config.nodeEnv !== 'production',
});
