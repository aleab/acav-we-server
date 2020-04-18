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
        process.stderr.write(`The program requires the following environment variables to run:\n  ${missing.join('\n  ')}\n\n`);
        process.exit(1);
    }
}
checkEnv('PORT', 'CRYPTO_KEY', 'SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REDIRECT_URI');

if (process.env.CRYPTO_KEY === 'myverysecurekey') {
    process.stderr.write('For security reasons, you must change the value of the CRYPTO_KEY environment variable!\n\n');
    process.exit(1);
}

function getEnv(...keys: string[]) {
    const env = {};
    keys.forEach(key => {
        env[key] = process.env[key];
    });
    return env;
}

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
app.use('/', (_, res) => res.render(path.join(__dirname, 'static', 'index.pug'), {
    env: JSON.stringify(getEnv('PORT', 'SPOTIFY_CLIENT_ID', 'SPOTIFY_REDIRECT_URI')),
}));

app.use((_, res) => res.status(404).end());

export default app;
