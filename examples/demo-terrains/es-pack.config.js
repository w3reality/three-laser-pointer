const path = require('path');
const fs = require('fs');

module.exports = {
    onBundle: (webpackConfig) => {
        webpackConfig.externals = {
            'three': 'THREE',
            'dat-gui-defaults': 'DatGuiDefaults',
            'threelet': 'Threelet',
        };

        const filename = webpackConfig.output.filename;
        webpackConfig.output.filename = filename.replace('no-pkg-name', 'app');
    },
};
