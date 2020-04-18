# acav-we-server
> Sample server code for [aCAV-WE](https://github.com/aleab/acav-we).

## Build and Usage Instructions
1. Clone this repository and install the project's dependencies.
   ```
   git clone https://github.com/aleab/acav-we-server
   cd acav-we-server
   npm install
   ```
2. Login to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and create a new app; then edit its settings and add a redirect URI, e.g. `http://localhost:4000/`.
3. Edit the `.env` file and add your Spotify app's information: Client ID, Client Secret and Redirect URI.
4. Build and run the project: `npm run build && npm run start -- --open`.
5. A new browser window/tab should have opened; use that page to request a new token and check if the local server is working correctly.

## Docker
You can use this repository to build a Docker image and self-host this server.

```shell
docker build -t aleab/acav-we-server --rm https://github.com/aleab/acav-we-server.git
docker run --name acav-we -p 4000:4000/tcp \
    -e CRYPTO_KEY=some_random_crypto_key \
    -e SPOTIFY_CLIENT_ID=your_spotify_client_id \
    -e SPOTIFY_CLIENT_SECRET=your_spotify_client_secret \
    aleab/acav-we-server
```

or, using `docker-compose`:

```yaml
acav-we:
    container_name: acav-we
    image: aleab/acav-we-server
    build: https://github.com/aleab/acav-we-server.git
    ports:
        - "4000:4000/tcp"
    environment:
        CRYPTO_KEY: "some_random_crypto_key"
        SPOTIFY_CLIENT_ID: "your_spotify_client_id"
        SPOTIFY_CLIENT_SECRET: "your_spotify_client_secret"
    restart: unless-stopped
```
