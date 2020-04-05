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
4. Build and run the project: `npm run build && npm run start`.
5. A new browser window/tab should have opened; use that page to request a new token and check if the local server is working correctly.
