import type { CodegenConfig } from '@graphql-codegen/cli';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

const config: CodegenConfig = {
  overwrite: true,
  ignoreNoDocuments: true,
  schema: [
    {
      [process.env.HASURA_URL || 'http://localhost:8080/v1/graphql']: {
        headers: {
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || '',
        },
      },
    },
  ],
  documents: ['src/**/*.gql'],
  generates: {
    'src/shared/graphql/generated/types.ts': {
      plugins: ['typescript'],
      config: {
        // Scalar type mappings for Hasura/PostgreSQL types
        scalars: {
          uuid: 'string',
          timestamptz: 'string',
          timestamp: 'string',
          jsonb: 'any',
          json: 'any',
          bigint: 'number',
          numeric: 'number',
          smallint: 'number',
          date: 'string',
          time: 'string',
          interval: 'string',
          organization_setup_status: "'pending_setup' | 'completed'",
        },
        // Type generation options
        maybeValue: 'T | null | undefined',
        exactOptionalPropertyTypes: true,
        enumsAsConst: true,
        addUnderscoreToArgsType: true,
        // Documentation
        addDocBlocks: true,
        // Make generated types more strict
        strictScalars: true,
        // Generate utility types
        declarationKind: 'interface',
      },
    },
    'src/shared/graphql/generated/operations.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-vue-apollo'],
      config: {
        // Scalar type mappings for Hasura/PostgreSQL types
        scalars: {
          uuid: 'string',
          timestamptz: 'string',
          timestamp: 'string',
          jsonb: 'any',
          json: 'any',
          bigint: 'number',
          numeric: 'number',
          smallint: 'number',
          date: 'string',
          time: 'string',
          interval: 'string',
          organization_setup_status: "'pending_setup' | 'completed'",
        },
        // Vue-specific options
        withCompositionFunctions: true,
        vueCompositionApiImportFrom: 'vue',
      },
    },
    'src/shared/graphql/generated/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
        commentDescriptions: true,
      },
    },
    'src/shared/graphql/generated/introspection.json': {
      plugins: ['introspection'],
    },
  },
};

export default config;
