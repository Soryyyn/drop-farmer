const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
require("dotenv").config();

module.exports = {
    module: {
        rules
    },
    optimization: {
        minimize: process.env.MINIMIZE == undefined ? true : false,
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    toplevel: true,
                    mangle: {
                        toplevel: true
                    }
                }
            })
        ]
    },
    plugins: [
        ...plugins,
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "src", "renderer", "assets"),
                    to: path.resolve(__dirname, ".webpack/renderer", "assets")
                }
            ]
        })
    ],
    resolve: {
        plugins: [new TsconfigPathsPlugin()],
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".scss"]
    }
};
