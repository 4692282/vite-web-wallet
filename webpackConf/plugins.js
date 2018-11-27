const path = require('path');
const webpack = require('webpack');
const OfflinePlugin = require('offline-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const packJson = require('../package.json');
const SRC_PATH = path.join(__dirname, '../src');
const Buffer_Path = path.join(__dirname, '../node_modules/buffer/index.js');
const TEMPLATE_PATH = path.join(__dirname, '../index.html');

const goViteServer = {
    production: '\'wss://testnet.vitewallet.com/ws\'',
    test: '\'wss://testnet.vitewallet.com/test/ws\'',
    dev: '\'wss://testnet.vitewallet.com/test/ws\''
};

const copyPath = [
    path.join(__dirname, '../redirects/_redirects'), 
    path.join(__dirname, '../manifest.json'),
    path.join(__dirname, '../src/assets/imgs/icon/vite_256_256.png'),
    path.join(__dirname, '../src/assets/imgs/icon/vite_512_512.png')
];

let plugins = [
    new HtmlWebpackPlugin({
        title: 'Vite Wallet',
        favicon: path.join(SRC_PATH, 'assets/imgs/logo.png'),
        template: TEMPLATE_PATH
    }),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
        'process.env.powDifficulty': '"157108864"',
        'process.env.version': `"${packJson.version}"`,
        'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
        'process.env.goViteServer': goViteServer[process.env.NODE_ENV || 'dev'],
        'process.env.viteNet': process.env.NODE_ENV === 'production' ? '\'https://testnet.vite.net/\'' : '\'http://132.232.134.168:8080/\''
    }),
    new webpack.NormalModuleReplacementPlugin(/\/buffer\//, function(resource) {
        resource.request = Buffer_Path;
    }),
    new OfflinePlugin(),
    new CopyWebpackPlugin(copyPath)
];

(process.env.analyzer === 'true') && plugins.push(new BundleAnalyzerPlugin());

module.exports = plugins;
