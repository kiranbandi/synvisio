module.exports = [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
    },
    {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
    },
    {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader?sourceMap']
    },
    {
        test: /\.css/,
        loaders: ['style-loader', 'css-loader']
    },
    {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff'
    },
    {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
            'file?hash=sha512&digest=hex&name=[hash].[ext]',
            'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
    },
    {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
    }
]