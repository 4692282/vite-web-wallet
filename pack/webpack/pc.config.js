const path = require('path');
const getEntry = require('./getEntry');
const { srcPath } = require('../config');

const PC_SRC_PATH = path.resolve(__dirname, '../srcPC');

const { entry, htmlWebpackPlugins } = getEntry({
    index: {
        path: path.join(PC_SRC_PATH, '/index.js'),
        title: 'ViteX, Exchange By the Community, For the Community',
        favicon: path.join(srcPath, 'assets/imgs/logo.png'),
        template: path.resolve(__dirname, '../index.html')
    }
});

export default {
    entry,
    htmlWebpackPlugins,
    resolve: {
        alias: {
            wallet: path.join(PC_SRC_PATH, '/wallet'),
            pcPages: path.join(PC_SRC_PATH, '/pages'),
            pcRouter: path.join(PC_SRC_PATH, '/router')
        }
    }
};

