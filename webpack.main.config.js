const plugins = require('./webpack.plugins');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/main/main.ts',
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
    optimization: {
        minimize: (process.env.MINIMIZE == undefined) ? true : false,
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    toplevel: true,
                    mangle: {
                        toplevel: true
                    }
                }
            }),
        ]
    },
    plugins: [
        ...plugins,
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'resources'),
                    to: path.resolve(__dirname, '.webpack/main', 'resources')
                }
            ]
        })
    ],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json', '.scss'],
    },
};
