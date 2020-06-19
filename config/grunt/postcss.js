const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const stylelint = require('stylelint');

module.exports = {
    development: {
        files: [
            {
                cwd: 'src/styles/',
                dest: 'build/styles/',
                expand: true,
                src: ['styles.css']
            }
        ],
        options: {
            processors: [autoprefixer()]
        }
    },
    lint: {
        options: {
            failOnError: true,
            processors: [stylelint({ config: { extends: 'stylelint-config-holy-grail' } })],
            writeDest: false
        },
        src: ['src/**/*.css']
    },
    production: {
        files: [
            {
                cwd: 'src/styles/',
                dest: 'build/styles/',
                expand: true,
                src: ['styles.css']
            }
        ],
        options: {
            processors: [autoprefixer(), cssnano()]
        }
    }
};
