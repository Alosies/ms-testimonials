import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: process.env.VITE_HASURA_GRAPHQL_ENDPOINT || 'http://localhost:8080/v1/graphql',
  documents: ['src/**/*.gql', 'src/**/*.graphql'],
  generates: {
    './src/shared/graphql/generated/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql',
        fragmentMasking: false,
      },
    },
    './src/shared/graphql/generated/operations.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-vue-apollo',
      ],
      config: {
        withCompositionFunctions: true,
        vueCompositionApiImportFrom: 'vue',
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
