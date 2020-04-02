const path = require('path');
const DotenvPlugin = require('webpack-dotenv-plugin');

const SRC_PATH = path.resolve(__dirname, 'src', 'frontend');
const DIST_PATH = path.resolve(__dirname, 'dist', 'static');

module.exports = (env, argv) => {
    const dotenvPlugin = new DotenvPlugin({ path: './.env', allowEmptyValues: false });

    /** @type {import('webpack').Configuration} */
    const config = {
        mode: 'production',
        entry: { index: './src/frontend/index.tsx' },
        output: {
            path: DIST_PATH,
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
        plugins: [dotenvPlugin],
    };
    return config;
};
