module.exports = {
    assets: {
        files: [
            {
                cwd: 'src/assets/',
                dest: 'build/assets/',
                expand: true,
                src: ['**']
            }
        ]
    }
};
