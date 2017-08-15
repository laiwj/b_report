var path = require('path');
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var es3ifyPlugin = require("es3ify-webpack-plugin");

//webpck插件
var plugins = [
    new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify('dev')
    }),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
    }),
    //提公用js到common.js文件中
    new webpack.optimize.CommonsChunkPlugin('js/common.js'),
    new HtmlWebpackPlugin({
        title: "报告分析平台登录系统",
        template: "tpl.html",
        filename: "index.html",
        hash: true
    }),
    //将样式统一发布到style.css中
    new ExtractTextPlugin("css/style.css", {
        allChunks: true,
        disable: false
    })
];
var entry = ['./src/main'],
    buildPath = "/dist/";
//编译输出路径
module.exports = {
    entry: entry,
    output: {
        path: __dirname + buildPath,
        filename: 'js/build.js',
        publicPath: '',
        chunkFilename: "js/[name].chunk.[chunkhash:8].js" //给require.ensure用
    },
    module: {
        loaders: [{
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(
                    "style-loader", "css-loader?minimize&sourceMap"),
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file"
            },
            {
                test: /\.(woff|woff2)$/,
                loader: "url?prefix=font/&limit=5000"
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/octet-stream"
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=image/svg+xml"
            },
            {
                test: /\.(jpg|png|gif)$/,
                loader: "file-loader?name=images/[name]-[hash].[ext]"
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&minetype=application/font-woff"
            }, {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            },
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: "es3ify"
            }
        ],
    },

    resolve: {
        extension: ['', '.js', '.css'],
        //别名
        alias: {
            mmRequest: path.join(__dirname, "src/lib/oniui/mmRequest/mmRequest"),
            mmPromise: path.join(__dirname, "src/lib/oniui/mmPromise/mmPromise"),
            mmHistory: path.join(__dirname, "src/lib/oniui/mmRouter/mmHistory"),
            mmRouter: path.join(__dirname, "src/lib/oniui/mmRouter/mmRouter"),
            mmState: path.join(__dirname, "src/lib/oniui/mmRouter/mmState"),
            avalon: path.join(__dirname, 'src/lib/avalon/avalon.shim'),
            '../avalon': path.join(__dirname, 'src/lib/avalon/avalon.shim'),
            echarts: path.join(__dirname, 'src/lib/charts/echarts.v3.min')
        }
    },
    plugins: plugins,
    devtool: '#source-map'
};