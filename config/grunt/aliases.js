const { env } = require('process');

// eslint-disable-next-line padding-line-between-statements
const filter = (tasks) => tasks.filter((task) => task !== null);
const isVersionUpdate =
    env.TRAVIS === 'true' && env.TRAVIS_PULL_REQUEST === 'false' && env.TRAVIS_SECURE_ENV_VARS === 'true' && env.TRAVIS_TAG !== '';

module.exports = {
    'build:development': ['clean', 'htmlmin', 'webpack:development', 'postcss:development'],
    'build:production': ['clean', 'htmlmin', 'webpack:production', 'postcss:production'],
    'deploy': ['build:production', 'gh-pages:deploy'],
    'deploy-on-version-updates': filter([isVersionUpdate ? 'deploy' : null]),
    'lint': ['postcss:lint', 'sh:lint-config', 'sh:lint-src'],
    'monitor': ['build:development', 'connect', 'watch:development'],
    'preview': ['build:production', 'connect', 'watch:production'],
    'smoke': ['sh:hyperlink']
};
