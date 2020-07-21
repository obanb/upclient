import {Request} from 'express';
import fetch from 'isomorphic-fetch';
import {ApiTokenResponse, EncodedToken} from '../model';
import jwt from 'jsonwebtoken';
import {LoginErrorResponse} from '../model/LoginErrorResponse';

export const AuthService = {
    /**
     * Prihlaseni pomoci emailu a hesla
     *
     * @param {string} endpoint
     * @param {string} email
     * @param {string} heslo
     * @param {boolean} mockSap
     * @returns {Promise<ApiTokenResponse>}
     */
    async loginWithEmailAndPassword(
        endpoint: string,
        email: string,
        heslo: string,
        typ: string,
        requestId: string | undefined,
        token: string | undefined,
    ): Promise<ApiTokenResponse | LoginErrorResponse> {
        const body = JSON.stringify({email, heslo, typ, requestId, token});
        return fetch(`${endpoint}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        }).then(async (res) => {
            if (res.status === 200 || res.status === 401) {
                return res.json();
            }
            throw new Error(res.statusText);
        });
    },

    decodeToken(req: Request, SECRET: string): Promise<EncodedToken> {
        return new Promise<EncodedToken>((resolve, reject) => {
            const token = req.cookies['x-access-token'];
            if (!token) {
                reject('No exist token in header');
                return;
            }
            jwt.verify(token, SECRET, (err: any, decoded: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    },
};
