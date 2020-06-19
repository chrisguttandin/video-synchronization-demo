const documentConfig = require('../htmlhint/document');

// eslint-disable-next-line padding-line-between-statements
const convertConfig = (config) =>
    Object.entries(config)
        .map(([key, value]) => (typeof value === 'string' ? `${key}=${value}` : key))
        .join(',');

module.exports = (grunt) => {
    const fix = grunt.option('fix') === true;

    return {
        'hyperlink': {
            cmd: 'hyperlink https://chrisguttandin.github.io/video-synchronization-demo'
        },
        'lint-config': {
            cmd: `eslint --config config/eslint/config.json --ext .js ${fix ? '--fix ' : ''}--report-unused-disable-directives *.js config/`
        },
        'lint-src': {
            cmd: `eslint --config config/eslint/src.json --ext .js ${
                fix ? '--fix ' : ''
            }--report-unused-disable-directives src/ && htmlhint --rules ${convertConfig(documentConfig)} 'src/**/index.html'`
        }
    };
};
