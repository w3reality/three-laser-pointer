const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const path = require('path');
const env = require('yargs').argv.env; // use --env with webpack 2
const pkg = require('./package.json');

const sourcePath = path.join(__dirname, './src');
const outputPath = path.join(__dirname, './dist');

const ThreeEs6Plugin = require('three-es6-plugin/dist');

let plugins = [], outputFile;
if (env === 'build') {
    plugins.push(new UglifyJsPlugin({ minimize: true }));
    outputFile = "[name].min.js";
} else {
    outputFile = "[name].js";
}

// workaround for infinite watch-compile loop...  https://github.com/webpack/watchpack/issues/25
plugins.push(new webpack.WatchIgnorePlugin([ /three-es6-plugin\/build\/.*\.js$/, ])),
plugins.push(new ThreeEs6Plugin([
    'three/examples/js/controls/OrbitControls.js',
    'three/examples/js/loaders/OBJLoader.js',
    'three/examples/js/loaders/MTLLoader.js',
    'three/examples/js/loaders/DDSLoader.js',
]));

module.exports = {
    entry: {
        'app': sourcePath + "/index.js",
    },
    output: {
        path: outputPath,
        filename: outputFile,
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /(\.jsx|\.js)$/,
                loader: 'eslint-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        modules: [path.resolve('./node_modules'), path.resolve('./src')],
        extensions: ['.json', '.js']
    },
    plugins: plugins
};
