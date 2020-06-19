const { resolve } = require('path');

module.exports = {
    development: {
        entry: {
            app: './src/scripts/app.js'
        },
        mode: 'development',
        module: {
            rules: [
                {
                    exclude: /node_modules/,
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        },
        output: {
            filename: '[name].js',
            path: resolve('build/scripts')
        }
    },
    production: {
        entry: {
            app: './src/scripts/app.js'
        },
        mode: 'production',
        module: {
            rules: [
                {
                    exclude: /node_modules/,
                    test: /\.js$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        },
        output: {
            filename: '[name].js',
            path: resolve('build/scripts')
        }
    }
};
