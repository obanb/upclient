import * as React from 'react';

import Document, {DocumentContext, Head, Main, NextScript} from 'next/document';
import {IncomingHttpHeaders} from 'http';
import {ServerStyleSheets} from '@material-ui/styles';

type CustomDocumentContext = DocumentContext & {req: {locale: string; localeDataScript: string; headers: IncomingHttpHeaders}};

interface WithLocaleProps {
    readonly locale: string;
    readonly localeDataScript: string;
}

interface WithUserAgentProps {
    readonly userAgent: string;
}

class MyDocument extends Document<WithLocaleProps & WithUserAgentProps> {
    render() {
        const {locale, localeDataScript, userAgent} = this.props;
        const isIE = userAgent.indexOf('Trident/') !== -1;

        // Babel polyfill for emulating ES2015+ features for older browsers, in our case only for IE 11.
        const babelPolyfill = 'https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.4.4/polyfill.min.js';
        // Polyfill Intl API for older browsers
        const polyfill = `https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.${locale}`;

        return (
            <html lang={locale} dir="ltr">
                <Head>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
                    <meta name="robots" content="noindex" />
                    <meta name="keywords" content="" />
                    <meta name="description" content="" />
                    <meta name="author" content="Untitled Project" />
                    <link rel="shortcut icon" type="image/x-icon" href="/static/images/favicon.ico" />
                    {/* TODO: až bude ikonka */}
                    {/* <link rel="icon" type="image/x-icon" href="/static/images/favicon.ico" />*/}
                    {/* TODO: See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/ */}
                    <link rel="manifest" href="/static/manifest.json" />
                    {/* PWA primary color */}
                    {/*<meta name="theme-color" content={pageContext.theme.palette.primary.main}/>*/}
                    {/*<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"/>*/}
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                </Head>
                <body>
                    <Main />
                    {/* load babel polyfill only for IE */}
                    {isIE && <script src={babelPolyfill} />}
                    <script src={polyfill} />
                    <script dangerouslySetInnerHTML={{__html: localeDataScript}} />
                    <NextScript />
                </body>
            </html>
        );
    }
}

MyDocument.getInitialProps = async (ctx: CustomDocumentContext) => {
    // Resolution order
    //
    // On the server:
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. document.getInitialProps
    // 4. app.render
    // 5. page.render
    // 6. document.render
    //
    // On the server with error:
    // 1. document.getInitialProps
    // 2. app.render
    // 3. page.render
    // 4. document.render
    //
    // On the client
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. app.render
    // 4. page.render

    // Render app and page and get the context of the page with collected side effects.
    const sheets = new ServerStyleSheets();
    const originalRenderPage = ctx.renderPage;

    const userAgent = ctx.req.headers['user-agent'];
    const locale = ctx.req.locale;
    const localeDataScript = ctx.req.localeDataScript;

    ctx.renderPage = () =>
        originalRenderPage({
            enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
        });

    const initialProps = await Document.getInitialProps(ctx);

    return {
        ...initialProps,
        // Styles fragment is rendered after the app and page rendering finish.
        styles: [
            <React.Fragment key="styles">
                {initialProps.styles}
                {sheets.getStyleElement()}
            </React.Fragment>,
        ],
        userAgent,
        locale,
        localeDataScript,
    };
};

export default MyDocument;
