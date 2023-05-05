const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const Dotenv = require('dotenv-webpack');

/**
 * Webpack rules.
 */
const Rules = [
    // Add support for native node modules
    {
        // We're specifying native_modules in the test because the asset relocator loader generates a
        // "fake" .node file which is really a cjs file.
        test: /native_modules\/.+\.node$/,
        use: 'node-loader'
    },
    {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack']
    },
    {
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
            loader: '@vercel/webpack-asset-relocator-loader',
            options: {
                outputAssetBase: 'native_modules'
            }
        }
    },
    {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
            loader: 'ts-loader',
            options: {
                transpileOnly: true
            }
        }
    },
    {
        test: /\.css$/i,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [
                            require('tailwindcss'),
                            require('autoprefixer')
                        ]
                    }
                }
            }
        ]
    }
];

/**
 * Minify and uglify settings.
 */
const Optimizations = {
    minimize: process.env.MINIMIZE == undefined ? true : false,
    minimizer: [
        new UglifyJsPlugin({
            cache: true,
            uglifyOptions: {
                toplevel: true,
                mangle: {
                    toplevel: true
                }
            }
        })
    ]
};

/**
 * Plugins shared between both configs.
 */
const SharedPlugins = [
    new ForkTsCheckerWebpackPlugin({
        async: false
    }),
    new Dotenv()
];

/**
 * Plugins only in the main config.
 */
const MainConfigPlugins = [
    new CopyWebpackPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, 'resources'),
                to: path.resolve(__dirname, '.webpack/main', 'resources')
            },
            {
                from: path.resolve(__dirname, 'CHANGELOG.md'),
                to: path.resolve(__dirname, '.webpack/main')
            }
        ]
    })
];

/**
 * Plugins only in the renderer config.
 */
const RendererConfigPlugins = [
    new CopyWebpackPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, 'src', 'renderer', 'assets'),
                to: path.resolve(__dirname, '.webpack/renderer', 'assets')
            }
        ]
    })
];

module.exports = {
    mainConfig: {
        entry: './src/main/main.ts',
        module: {
            rules: Rules
        },
        optimization: Optimizations,
        plugins: [...SharedPlugins, ...MainConfigPlugins],
        resolve: {
            plugins: [new TsconfigPathsPlugin()],
            extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
        },
        watchOptions: {
            ignored: /node_modules/
        }
    },
    rendererConfig: {
        module: {
            rules: Rules
        },
        optimization: Optimizations,
        plugins: [...SharedPlugins, ...RendererConfigPlugins],
        resolve: {
            plugins: [new TsconfigPathsPlugin()],
            extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
        },
        watchOptions: {
            ignored: /node_modules/
        }
    }
};
