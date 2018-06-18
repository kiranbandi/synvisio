'use strict';
var webpack = require("webpack");
var path = require("path");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/app.jsx'],
    output: {
        path: path.resolve("build/assets/bundle"),
        filename: "bundle.js",
        publicPath: path.resolve("build/assets/bundle") + '/'
    },
    plugins: [new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new UglifyJSPlugin({
            sourceMap: false
        })
    ],
    module: {
        rules: require("./rules.config"),
    },
    resolve: {
        extensions: ['.js', '.jsx']
    }
}