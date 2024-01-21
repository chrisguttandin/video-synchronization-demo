/* eslint-disable check-file/filename-naming-convention */
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
    plugins: [autoprefixer(), cssnano()]
};
