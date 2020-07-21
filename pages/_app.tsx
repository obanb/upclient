import * as React from 'react';
import Head from 'next/head';
import App, {Container} from 'next/app';

import {ContextConsumer, ContextProvider, withApollo, withIntl} from '../client/with';
import {CssBaseline, MuiThemeProvider} from '@material-ui/core';
import {ApolloClient} from 'apollo-client';
import {ApolloProvider} from '@apollo/react-hooks';
import {appThemeOptions} from '../client/with/theme';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

interface Props {
    apolloClient: ApolloClient<any>;
}

const compose = (...fns) => fns.reduceRight((prevFn, nextFn) => (...args) => nextFn(prevFn(...args)), (value) => value);

class NextApp extends App<Props> {
    componentDidMount() {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentNode.removeChild(jssStyles);
        }
    }

    render() {
        const {Component, pageProps, apolloClient} = this.props;
        return (
            <Container>
                <Head>
                    <title>My page</title>
                </Head>
                <ApolloProvider client={apolloClient}>
                    <ContextProvider>
                        <ContextConsumer>
                            {({theme}) => {
                                const muiTheme = createMuiTheme(appThemeOptions[theme] as any);
                                return (
                                    <MuiThemeProvider theme={muiTheme}>
                                        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                                        <CssBaseline />
                                        <Component {...pageProps} />
                                    </MuiThemeProvider>
                                );
                            }}
                        </ContextConsumer>
                    </ContextProvider>
                </ApolloProvider>
            </Container>
        );
    }
}

export default compose(
    withApollo,
    withIntl,
)(NextApp);
