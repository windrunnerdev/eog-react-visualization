import { ApolloClient, InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
  addTypename: false,
  resultCaching: false,
});

export const GqlClient = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_API,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});
