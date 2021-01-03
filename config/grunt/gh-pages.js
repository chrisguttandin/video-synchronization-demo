const { env } = require('process');
const pkg = require('../../package.json');

module.exports = {
    deploy: {
        options: {
            base: 'build/',
            message: `build page for version ${(env.GITHUB_REF || '').slice(10)}`,
            repo: pkg.repository.url.replace(/:\/\//, `://${env.GIT_HUB_ACCESS_TOKEN}@`),
            silent: true,
            user: {
                email: env.GIT_HUB_USER_EMAIL,
                name: env.GIT_HUB_USER_NAME
            }
        },
        src: ['**']
    }
};
