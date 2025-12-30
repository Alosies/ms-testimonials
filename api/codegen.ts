import type { CodegenConfig } from '@graphql-codegen/cli';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [process.env.HASURA_URL || 'http://localhost:8080/v1/graphql']: {
        headers: {
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || '',
        },
      },
    },
  ],
  documents: ['src/**/*.gql', 'src/**/*.graphql'],
  generates: {
    'src/graphql/generated/types.ts': {
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
        },
        maybeValue: 'T | null | undefined',
        exactOptionalPropertyTypes: true,
        enumsAsConst: true,
        addUnderscoreToArgsType: true,
        addDocBlocks: true,
        strictScalars: true,
        declarationKind: 'interface',
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
        },
        exportFragmentSpreadSubTypes: true,
        dedupeFragments: true,
      },
    },
    'src/graphql/generated/operations.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
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
        },
        rawRequest: false,
        documentMode: 'string',
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
        },
        exportFragmentSpreadSubTypes: true,
        dedupeFragments: true,
        addDocBlocks: true,
        enumsAsConst: true,
      },
    },
    'src/graphql/generated/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
  // hooks: {
  //   afterAllFileWrite: ['prettier --write'],
  // },
};

export default config;
