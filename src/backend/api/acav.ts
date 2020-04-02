import AxiosStatic from 'axios';
import express from 'express';
import qs from 'qs';

import crypto from '../crypto';

const axios = AxiosStatic.create({
    baseURL: 'https://accounts.spotify.com',
    validateStatus(status) {
        return status >= 200 && status <= 503;
    },
});

axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const router = express.Router();

// GET /authorize_callback
//     ?code &state &redirect
//     ?error
router.get('/authorize_callback', (req, res) => {
    if (req.query['code']) {
        const redirectUri = req.query['redirect'];
        axios({
            method: 'POST',
            url: '/api/token',
            data: qs.stringify({
                grant_type: 'authorization_code',
                code: req.query['code'],
                redirect_uri: redirectUri ?? process.env.SPOTIFY_REDIRECT_URI,
            }),
            auth: {
                username: process.env.SPOTIFY_CLIENT_ID,
                password: process.env.SPOTIFY_CLIENT_SECRET,
            },
        }).then(tokenResponse => {
            const json = tokenResponse.data;
            if (tokenResponse.status === 200) {
                const tokenObj = {
                    access_token: json['access_token'],
                    refresh_token: json['refresh_token'],
                    expires_at: new Date(Date.now() + Number(json['expires_in']) * 1000).getTime(),
                    τ: new Date(Date.now() + 2 * 60 * 1000).getTime(),
                };

                const encrypted = crypto.encrypt(JSON.stringify(tokenObj));
                res.setHeader('Content-Type', 'text/plain');
                res.send(encrypted);
            } else {
                res.status(tokenResponse.status).json(json);
            }
        }).catch(err => {
            console.error(err);
            res.status(500).end();
        });
    } else if (req.query['error']) {
        res.status(400).json({ error_description: req.query['error'] });
    } else {
        res.status(400).end();
    }
});

// POST /refresh
//      refresh_token
router.post('/refresh', (req, res) => {
    if (req.body['refresh_token']) {
        axios({
            method: 'POST',
            url: '/api/token',
            data: qs.stringify({
                grant_type: 'refresh_token',
                refresh_token: req.body['refresh_token'],
            }),
            auth: {
                username: process.env.SPOTIFY_CLIENT_ID,
                password: process.env.SPOTIFY_CLIENT_SECRET,
            },
        }).then(tokenResponse => {
            switch (tokenResponse.status) {
                case 200:
                    res.json({
                        access_token: tokenResponse.data['access_token'],
                        expires_at: new Date(Date.now() + Number(tokenResponse.data['expires_in']) * 1000).getTime(),
                    });
                    break;

                case 429: // Rate limit
                    if (tokenResponse.headers['Retry-After']) {
                        res.header('Retry-After', tokenResponse.headers['Retry-After']);
                    }
                    res.status(429).end();
                    break;

                case 401: // Unauthorized
                case 503: // Service Unavailable
                default:
                    res.status(tokenResponse.status).send(tokenResponse.data);
                    break;
            }
        }).catch(err => {
            console.log(err);
            res.status(500).end();
        });
    } else {
        res.status(400).end();
    }
});

// POST /token
//      token
router.post('/token', (req, res) => {
    if (req.body['token']) {
        try {
            const decrypted = crypto.decrypt(req.body['token']);
            const json = JSON.parse(decrypted);
            if (typeof json !== 'object' || !json['τ'] || !json['access_token'] || !json['refresh_token'] || !json['expires_at']) {
                res.status(400).end();
            } else {
                const t = Number(json['τ']) - Date.now();
                if (t < 0) {
                    res.status(403).end();
                } else {
                    res.json({
                        access_token: json['access_token'],
                        refresh_token: json['refresh_token'],
                        expires_at: json['expires_at'],
                    });
                }
            }
        } catch (err) {
            res.status(500).end();
        }
    } else {
        res.status(400).end();
    }
});

export default router;
