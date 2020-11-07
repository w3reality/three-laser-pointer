const path = require('path');
const fs = require('fs');

module.exports = {
    onBundle: (webpackConfig) => {
        webpackConfig.externals = {
            'three': 'THREE',
            'dat-gui-defaults': 'DatGuiDefaults',
            'stats.js': 'Stats',
            'jquery': '$',
        };

        const filename = webpackConfig.output.filename;
        webpackConfig.output.filename = filename.replace('no-pkg-name', 'app');

        // for 'es-pack-js/src/meta'
        webpackConfig.resolve.modules.push(path.resolve(`${__dirname}/../../node_modules`));
    },
};
