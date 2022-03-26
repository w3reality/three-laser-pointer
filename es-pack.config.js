const path = require('path');
const fs = require('fs');

module.exports = {
    onBundle: (webpackConfig, webpack) => {
        webpackConfig.externals = { 'three': 'THREE' };
        webpackConfig.output.library = 'Laser';
    },
    onVerify: (preloadJs) => {
        const pathUpper = path.resolve(__dirname, './node_modules/THREE');
        if (!fs.existsSync(pathUpper)) { // can be true on linux (case-sensitive fs)
            // ├── node_modules
            // │   └── THREE -> ./three
            try { fs.symlinkSync('./three', pathUpper); } catch (_) {}
        }

        preloadJs.node = path.resolve(__dirname, './tests/node/preload.js');
        preloadJs.browser = path.resolve(__dirname, './node_modules/three/build/three.min.js');
    },
};
