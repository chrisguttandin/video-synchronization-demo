module.exports = {
    html: {
        files: [
            {
                cwd: 'src/',
                dest: 'build/',
                expand: true,
                src: ['index.html']
            }
        ],
        options: {
            caseSensitive: true,
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeComments: true
        }
    }
};
