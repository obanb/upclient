import {HttpLink} from 'apollo-link-http';
import fetch from 'isomorphic-fetch';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloClient} from 'apollo-client';
import {onError} from 'apollo-link-error';
import {setContext} from 'apollo-link-context';
import {ApolloLink} from 'apollo-link';

declare const process: any;
declare const global: any;

let apolloClient: ApolloClient<any>;

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
    global.fetch = fetch;
}

const errorLink = onError(({graphQLErrors, networkError, operation}) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({message, path}) => console.log(`[GraphQL error]: Message: ${message}, Path: ${path}`));
    }

    if (networkError) {
        console.log(`[Network error ${operation.operationName}]: ${networkError.message}`);
    }
});

const create = (initialState: any, {getToken}: {getToken: () => string}, req?: any) => {
    const baseUrl = `${req ? `${req.protocol}://${req.get('Host')}` : ''}/api`;
    const authLink = setContext((_, {headers}) => {
        const token = getToken();
        return {
            headers: {
                ...headers,
                authorization: token ? `Bearer ${token}` : '',
            },
        };
    });
    return new ApolloClient({
        connectToDevTools: process.browser,
        ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
        link: ApolloLink.from([
            errorLink,
            authLink,
            new HttpLink({
                uri: `${baseUrl}/graphql`,
                fetchOptions: {credentials: 'same-origin', fetch},
            }),
        ]),
        cache: new InMemoryCache().restore(initialState || {}),
    });
};

export const initApollo = (initialState: any, options: {getToken: () => string}, req?: any) => {
    // Make sure to create a new client for every server-side request so that data
    // isn't shared between connections (which would be bad)
    if (!process.browser) {
        return create(initialState, options, req);
    }

    // Reuse client on the client-side
    if (!apolloClient) {
        apolloClient = create(initialState, options, req);
    }

    return apolloClient;
};
