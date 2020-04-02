import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const CRYPTO_ALGORITHM = 'aes-256-gcm';

function encrypt(text: string) {
    const iv = randomBytes(16);
    const key = createHash('sha256').update(process.env.CRYPTO_KEY).digest();
    const cipher = createCipheriv(CRYPTO_ALGORITHM, key, iv);
    const encryptedText = cipher.update(text);

    const a = iv.toString('base64');
    const b = Buffer.concat([ encryptedText, cipher.final() ]).toString('base64');
    const c = cipher.getAuthTag().toString('base64');
    return `${a}.${b}.${c}`;
}

function decrypt(encrypted: string) {
    const data = encrypted.split('.');
    if (data.length !== 3) {
        throw new Error('Invalid data');
    }

    const iv = Buffer.from(data[0], 'base64');
    const encryptedText = Buffer.from(data[1], 'base64');
    const authTag = Buffer.from(data[2], 'base64');
    const key = createHash('sha256').update(process.env.CRYPTO_KEY).digest();
    const decipher = createDecipheriv(CRYPTO_ALGORITHM, key, iv).setAuthTag(authTag);
    const decrypted = decipher.update(encryptedText);
    return Buffer.concat([ decrypted, decipher.final() ]).toString();
}

export default { encrypt, decrypt };
