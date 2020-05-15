FROM node:alpine

RUN mkdir -p /usr/src/acav-we
WORKDIR /usr/src/acav-we

COPY . /usr/src/acav-we
RUN chmod 755 -R . && \
    npm install && \
    npm run build

ENV CRYPTO_KEY=myverysecurekey \
    SPOTIFY_CLIENT_ID= \
    SPOTIFY_CLIENT_SECRET= \
    SPOTIFY_REDIRECT_URI=

EXPOSE 4000

CMD [ "npm", "run", "start" ]
