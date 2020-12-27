const stylelint = require('stylelint');

module.exports = {
    plugins: [
        stylelint({ config: { extends: 'stylelint-config-holy-grail' } })
    ]
};
