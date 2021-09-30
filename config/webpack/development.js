const { resolve } = require('path');

module.exports = {
    devtool: 'source-map',
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
        path: resolve('build/scripts'),
        publicPath: '/scripts/'
    }
};
