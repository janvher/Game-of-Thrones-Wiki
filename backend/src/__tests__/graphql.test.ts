import { describe, it, expect } from 'vitest';
import { typeDefs } from '../graphql/schema.js';

describe('GraphQL schema', () => {
  it('defines Query and Mutation types', () => {
    expect(typeDefs).toContain('type Query');
    expect(typeDefs).toContain('type Mutation');
    expect(typeDefs).toContain('favorites');
    expect(typeDefs).toContain('addFavorite');
  });
});
