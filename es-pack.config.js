module.exports = {
    onConfigCreated: config => {
        config.externals = {three: 'THREE'};
        config.output.library = 'Laser';
    },
};
