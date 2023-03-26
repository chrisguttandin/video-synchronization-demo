module.exports = (grunt) => {
    const fix = grunt.option('fix') === true;

    return {
        'build-development': {
            cmd: `webpack --config config/webpack/development.js && \
                npx postcss src/**/*.css --base src/ --config config/postcss/build-development/ --dir build/`
        },
        'build-production': {
            cmd: `webpack --config config/webpack/production.js && \
                npx postcss src/**/*.css --base src/ --config config/postcss/build-production/ --dir build/`
        },
        'clean': {
            cmd: 'rimraf build/*'
        },
        'html-minifier': {
            cmd: 'html-minifier --config-file config/html-minifier/config.json --file-ext html --input-dir src --output-dir build'
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
