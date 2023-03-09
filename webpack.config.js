const webpack = require("webpack");
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const  CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

console.log(path.resolve(__dirname,'public'));

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new CssMinimizerPlugin(),
            new TerserPlugin()
        ]
    }

    return config
}

const fileName = ext => isDev ? `[name].${ext}` : `[name].[chunkhash].${ext}`

const plugins = () => {
    const base = [
        new HtmlWebpackPlugin({
            template: './index.html',
            minify: {
                collapseWhitespace: isProd
            }
        }),
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname,'src/favicon.ico'),
                    to: path.resolve(__dirname,'public')
                },
                {
                    from: path.resolve(__dirname,'src/img'),
                    to: path.resolve(__dirname,'public/img')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: fileName('css')
        })
        
    ]

    if (isProd) {
        base.push(new BundleAnalyzerPlugin())
    }

    return base
}

module.exports = {
    context: path.resolve(__dirname,'src'),
    mode: 'development',
    entry: {
        main: './js/index.js',
    },
    output: {
        filename: fileName('js'),
        path: path.resolve(__dirname, 'public')
    },
    resolve: {
        extensions: ['.js', '.svg'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    optimization: optimization(),
    devServer: {
        static: {
            directory: path.join(__dirname, 'src'),
        },
        compress: true,
        port: 4200,
        open: true,
        hot: isDev
    },
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.s?css$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {},
                  }, 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/,
                type: 'asset/resource'
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                type: 'asset/resource'
            }
        ]
    }
}


if (isDev) {
    // only enable hot in development
    module.exports.plugins.push(new webpack.HotModuleReplacementPlugin());
}