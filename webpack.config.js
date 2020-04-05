const path = require('path');

const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const DotenvPlugin = require('webpack-dotenv-plugin');

const packageJson = require('./package.json');

module.exports = () => {
    const dotenvPlugin = new DotenvPlugin({ path: './.env', allowEmptyValues: false });
    const licensePlugin = new LicenseWebpackPlugin({
        outputFilename: 'LICENSES.3RD-PARTY.txt',
        perChunkOutput: false,
        preferredLicenseTypes: ['MIT'],
        unacceptableLicenseTest: licenseType => !(/(Apache|BSD|ISC|MIT)/i.test(licenseType)),
        excludedPackageTest: packageName => {
            if (!packageJson.dependencies) return false;
            return packageJson.dependencies[packageName] === undefined;
        },
        renderLicenses: modules => {
            let text = '';
            const M = modules.sort((m1, m2) => m1.name.localeCompare(m2.name));
            for (let i = 0; i < M.length; ++i) {
                text += '/**\n' +
                        ` * ${M[i].name}\n` +
                        ' *\n' +
                        ` * ${M[i].licenseId}\n` +
                        (M[i].licenseText !== null ? M[i].licenseText.split(/\r?\n/).map(s => ` * ${s}`).join('\n') : ' * null') + '\n' +
                        ' */\n' +
                        '\n';
            }
            return text;
        },
    });

    /** @type {import('webpack').Configuration} */
    const config = {
        mode: 'production',
        entry: { index: './src/frontend/index.tsx' },
        output: {
            path: path.resolve(__dirname, 'dist', 'static'),
            filename: '[name].js',
            publicPath: '/',
        },
        resolve: {
            extensions: [ '.ts', '.tsx', '.js' ],
            alias: {
                react: 'preact/compat',
                'react-dom/test-utils': 'preact/test-utils',
                'react-dom': 'preact/compat',
            },
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts)x?$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [dotenvPlugin, licensePlugin],
    };
    return config;
};
