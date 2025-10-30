// GraphQL Context type
export interface GraphQLContext {
  user?: {
    id: string;
    role: string;
  };
}

// JWT Payload type for token verification
export interface JWTPayload {
  id: string;
  role: string;
}

// GraphQL resolver parent type (unused in most cases)
export type ResolverParent = unknown;

// GraphQL resolver info type (unused in most cases)
export type ResolverInfo = unknown;
