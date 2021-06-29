module.exports = (grunt) => {
    const fix = grunt.option('fix') === true;

    return {
        'build-development': {
            cmd: 'npx postcss src/**/*.css --base src/ --config config/postcss/build-development/ --dir build/'
        },
        'build-production': {
            cmd: 'npx postcss src/**/*.css --base src/ --config config/postcss/build-production/ --dir build/'
        },
        'hyperlink': {
            cmd: 'hyperlink https://chrisguttandin.github.io/video-synchronization-demo'
        },
        'lint-config': {
            cmd: `eslint --config config/eslint/config.json --ext .js ${fix ? '--fix ' : ''}--report-unused-disable-directives *.js config/`
        },
        'lint-src': {
            cmd: `eslint --config config/eslint/src.json --ext .js ${fix ? '--fix ' : ''}--report-unused-disable-directives src/ && \
                htmlhint --config config/htmlhint/document.json 'src/**/index.html' && \
                npx stylelint src/**/*.css --config config/stylelint/config.json`
        }
    };
};
