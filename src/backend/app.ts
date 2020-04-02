import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

import acav from './api/acav';

// Configure and check environment
dotenv.config();

function checkEnv(...keys: string[]) {
    const missing: string[] = [];
    keys.forEach(key => {
        if (!process.env[key]) {
            missing.push(key);
        }
    });
    if (missing.length > 0) {
        process.stderr.write(`The program requires the following environment varibles to run:\n  ${missing.join('\n  ')}\n`);
        process.exit(1);
    }
}
checkEnv('PORT', 'CRYPTO_KEY', 'SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REDIRECT_URI');

// Configure middlewares
const app = express();

app.use((req, res, next) => {
    const end = res.end;
    res.end = function _end(...args) {
        res.end = end;
        res.end.apply(this, args);
        console.log(`${req.socket.remoteAddress.padEnd(15, ' ')} ${req.method.padEnd(4, ' ')} ${req.originalUrl} - ${res.statusCode}`);
    };
    next();
});

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/acav', acav);
app.use('/', (_, res) => res.sendFile(path.join(__dirname, 'static', 'index.html')));

app.use((_, res) => res.status(404).end());

export default app;
