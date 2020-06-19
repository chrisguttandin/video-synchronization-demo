module.exports = {
    development: {
        files: ['src/**'],
        options: {
            livereload: true
        },
        tasks: ['build:development']
    },
    production: {
        files: ['src/**'],
        options: {
            livereload: true
        },
        tasks: ['build:production']
    }
};
