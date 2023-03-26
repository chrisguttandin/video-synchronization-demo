module.exports = {
    build: ['sh:clean', 'sh:html-minifier', 'sh:build'],
    lint: ['sh:lint-config', 'sh:lint-src'],
    monitor: ['sh:monitor'],
    smoke: ['sh:hyperlink']
};
