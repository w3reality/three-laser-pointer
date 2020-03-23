const path = require('path');
const fs = require('fs');

module.exports = {
    onBundle: (webpackConfig) => {
        webpackConfig.externals = { 'three': 'THREE' };
        webpackConfig.output.library = 'Laser';
    },
    onVerify: (preloadJs) => {
        preloadJs.node = path.resolve(__dirname, './tests/node/preload.js');
        preloadJs.browser = path.resolve(__dirname, './node_modules/three/build/three.min.js');
    },
};
