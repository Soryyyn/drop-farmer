import CopyWebpackPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path, { join } from 'path';
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import type { Configuration } from 'webpack';

/**
 * Measure the speed of the webpack builds.
 */
const SpeedMeasure = new SpeedMeasurePlugin();

/**
 * Webpack rules.
 */
const Rules: Required<Configuration>['module']['rules'] = [
    {
        test: /native_modules\/.+\.node$/,
        use: 'node-loader'
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
        include: join(__dirname, '/src'),
        use: {
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
                happyPackMode: true
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
 * Plugins shared between both configs.
 */
const SharedPlugins: Configuration['plugins'] = [
    new ForkTsCheckerWebpackPlugin({
        async: false
    }),
    new Dotenv()
];

/**
 * Plugins only in the main config.
 */
const MainConfigPlugins: Configuration['plugins'] = [
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
const RendererConfigPlugins: Configuration['plugins'] = [
    new CopyWebpackPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, 'src', 'renderer', 'assets'),
                to: path.resolve(__dirname, '.webpack/renderer', 'assets')
            }
        ]
    })
];

/**
 * Minimize the build with terser.
 */
const Optimization: Configuration['optimization'] = {
    minimize: process.env.NODE_ENV === 'prodcution',
    minimizer: [
        new TerserPlugin({
            parallel: true,
            terserOptions: {
                mangle: {
                    toplevel: true
                }
            }
        })
    ]
};

export const MainProcessConfig: Configuration = SpeedMeasure.wrap({
    target: 'electron-main',
    entry: './src/main/main.ts',
    optimization: Optimization,
    module: {
        rules: Rules
    },
    plugins: [...SharedPlugins, ...MainConfigPlugins],
    resolve: {
        plugins: [new TsconfigPathsPlugin()],
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
    },
    watchOptions: {
        ignored: /node_modules/
    }
});

export const RendererProcessConfig: Configuration = SpeedMeasure.wrap({
    target: 'web',
    optimization: Optimization,
    module: {
        rules: Rules
    },
    plugins: [...SharedPlugins, ...RendererConfigPlugins],
    resolve: {
        plugins: [new TsconfigPathsPlugin()],
        extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json']
    },
    watchOptions: {
        ignored: /node_modules/
    }
});
