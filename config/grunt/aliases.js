module.exports = {
    'build:development': ['sh:clean', 'sh:html-minifier', 'sh:build-development', 'copy:assets'],
    'build:production': ['sh:clean', 'sh:html-minifier', 'sh:build-production', 'copy:assets'],
    'lint': ['sh:lint-config', 'sh:lint-src'],
    'monitor': ['build:development', 'connect', 'watch:development'],
    'preview': ['build:production', 'connect', 'watch:production'],
    'smoke': ['sh:hyperlink']
};
