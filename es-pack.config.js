module.exports = {
    onConfigCreated: config => {
        config['externals'] = {three: 'THREE'};
    },
};
