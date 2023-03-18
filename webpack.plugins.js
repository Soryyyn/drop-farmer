const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = [
    new ForkTsCheckerWebpackPlugin({
        async: false
    }),
    new Dotenv()
];
