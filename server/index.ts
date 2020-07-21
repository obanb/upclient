import accepts from 'accepts';
import express from 'express';
import {NextFunction, Request, Response} from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import IntlPolyfill from 'intl';
import {readFileSync} from 'fs';
import {basename, join} from 'path';
import {parse} from 'url';
import {sync} from 'glob';
import {AuthService} from './service';
import {ApiTokenResponse, EncodedToken, LoginErrorResponse} from './model';

// tslint:disable-next-line
const proxy = require('express-http-proxy');
// tslint:disable-next-line
require('dotenv').config();

Intl.NumberFormat = IntlPolyfill.NumberFormat;
Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;

declare const process: any;
const dev: boolean = process.env.NODE_ENV !== 'production';

// inicializace next.js aplikace
const next = require('next');
const app = next({dev});
const handle = app.getRequestHandler();

const languages = sync('./lang/*.json').map((f) => basename(f, '.json'));

// We need to expose React Intl's locale data on the request for the user's
// locale. This function will also cache the scripts by lang in memory.
const localeDataCache = new Map();
const getLocaleDataScript = (locale: string) => {
    const lang = locale.split('-')[0];
    if (!localeDataCache.has(lang)) {
        const localeDataFile = require.resolve(`react-intl/locale-data/${lang}`);
        const localeDataScript = readFileSync(localeDataFile, 'utf8');
        localeDataCache.set(lang, localeDataScript);
    }
    return localeDataCache.get(lang);
};

// We need to load and expose the translations on the request for the user's
// locale. These will only be used in production, in dev the `defaultMessage` in
// each message description in the source code will be used.
const getMessages = (locale: string) => require(`../lang/${locale}.json`);

export const {BACKEND_ENDPOINT} = process.env;

const SECRET = 'tajny-jwt-salt';

const withLocaleRequest = (req: any): any => {
    // When you change language other way (with browser settings is now), you must rewrite get locale from client on this code row
    const localeFromRequest = accepts(req).language(languages);
    req.locale = localeFromRequest ? localeFromRequest : 'cs'; // Fallback to CS locale

    req.localeDataScript = getLocaleDataScript(req.locale);
    req.messages = getMessages(req.locale);
    return req;
};

app.prepare().then(() => {
    const server = express();
    // server.enable('trust proxy');

    server.use(bodyParser.json({limit: '10mb'}));
    server.use(bodyParser.urlencoded({extended: false}));

    server.use(cookieParser());

    server.get('/healthz', (_, res) => {
        // check my health
        // -> return next(new Error('DB is unreachable'))
        res.sendStatus(200);
    });

    server.use(
        '/api',
        proxy(process.env.BACKEND_ENDPOINT, {
            proxyReqOptDecorator: async (proxyReqOpts, srcReq) => {
                try {
                    proxyReqOpts.headers.Authorization = `Bearer ${(await AuthService.decodeToken(srcReq, SECRET)).token}`;
                    return proxyReqOpts;
                } catch (err) {
                    return proxyReqOpts;
                }
            },
        }),
    );

    /**
     * Kontrola podle loginu a hesla
     * V pripade spravneho prihlaseni, vraci JWT token
     * Dale vraci i xsrfToken, ktery je pouzit pro prevenci pred CSRF utokem
     * FIXME: je dulezite pouzit komplikovanejsi 'jwtSecret' klic, ktery vice zapezpecuje ziskani tokenu hrubou silou
     */
    server.post('/authenticate', async (req, res) => {
        const {email, heslo, typ, requestId, token} = req.body;
        try {
            const response = await AuthService.loginWithEmailAndPassword(BACKEND_ENDPOINT, email, heslo, typ, requestId, token);
            if ((response as LoginErrorResponse).error) {
                res.status(401).json(response);
            } else {
                const {token, expiresIn, email: emailFromResponse, userFullAccess} = response as ApiTokenResponse;

                const safeEmail = email ? email : emailFromResponse;

                // Sign token
                const xsrfToken = crypto
                    .createHash('md5')
                    .update(safeEmail)
                    .digest('hex');
                const clientToken = jwt.sign({token, email: safeEmail, xsrfToken} as EncodedToken, SECRET, {expiresIn});

                res.status(200).json({
                    success: true,
                    token: clientToken,
                    expiresIn: process.env.DEV_UNLIMITED_SESSION === 'true' ? expiresIn : undefined,
                    userFullAccess,
                });
            }
        } catch (err) {
            res.status(401).json({error: err.message});
        }
    });

    /**
     * Auth middleware
     * Middleware se aplikuje na vsechny routy, krome: ['/login', '/_next', ...]
     */
    server.use(
        unless(['/login', '/nastaveniHesla', '/_next', '/static', '/_info'], async (req, res, next) => {
            try {
                req.decoded = await AuthService.decodeToken(req, SECRET);
                next();
            } catch (err) {
                // tslint:disable-next-line
                console.warn('Bad decode token: ', err);
                res.clearCookie('x-access-token');
                res.redirect(`/login?path=${encodeURI(req.path)}`);
            }
        }),
    );

    /**
     * Ukazka na prevenci CRSF utoku
     */
    server.post('/api/preventCRSF', (req: any, res) => {
        if (req.decoded.xsrfToken === req.get('X-XSRF-TOKEN')) {
            res.status(200).json({success: true, message: 'Yes, this api is protected by CRSF attack'});
        } else {
            res.status(400).json({success: false, message: 'CRSF attack is useless'});
        }
    });

    // Handle password reset
    server.get('/nastaveniHesla/:id', (req, res) => {
        app.render(withLocaleRequest(req), res, '/nastaveniHesla', {
            id: req.params.id,
        });
    });

    /**
     * Routa pro stahování statických souborů z adresáře ./static/download
     * GET /download/:file
     * Díky res.download() automaticky nastavuje potřebné response hlavičky:
     * Content-Disposition: attachment; filename={file}
     * Content-Type: {mimeType} - mimeType získá podle file extension
     * A navíc umožňuje specifikovat název staženého souboru
     */
    server.get('/download/:file', (req, res) => {
        const filename = req.params.file;
        const {pathname} = parse(req.url, true);
        const fileLocation = join(__dirname, '../static', pathname);
        res.download(fileLocation, filename);
    });

    /**
     * Vsechny routy, smerujici na domenu jsou obslouzeny Next.js
     * Diky explicitni konfiguraci je mozne definovat vlastni routy, ktere budou presmerovavat dane pozadavky na dane stranky
     */
    server.get('*', (req: any, res) => {
        return handle(withLocaleRequest(req), res);
    });

    const PORT = process.env.PORT || 8081;
    server.listen(PORT, () => {
        // tslint:disable-next-line
        console.log(`Server is ready on PORT=${PORT}`);
    });
});

type MiddlewareType = (req: Request & {decoded?: any}, res: Response, next: NextFunction) => void;
const unless = (paths: string[], middleware: MiddlewareType) => (req: Request, res: Response, next: NextFunction) => {
    if (paths.find((path) => path === req.path || req.path.includes(path))) {
        return next();
    } else {
        return middleware(req, res, next);
    }
};
