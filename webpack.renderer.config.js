const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

rules.push({
    test: /\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
    module: {
        rules,
    },
    plugins: [
        ...plugins,
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src', 'renderer', 'assets'),
                    to: path.resolve(__dirname, '.webpack/renderer', 'assets')
                },
                {
                    from: path.resolve(__dirname, 'src', 'common'),
                    to: path.resolve(__dirname, '.webpack', 'common')
                }
            ]
        })
    ],
    resolve: {
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    },
};
