const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');

var path = require('path');

module.exports = {
	entry : {
        'homepage': "./src/homepage.js",
        'app': "./src/main.browser.ts"
    },
	output : {
		filename : '[name].js',
		path : path.resolve(__dirname, 'src/generated/resources/static/app'),
    },
    resolve: {
        extensions: ['.ts', '.js']
	},
	module : {
		loaders : [{
            test: /\.ts$/,
            loader: 'awesome-typescript-loader'
        }, {
			test : /\.css$/,
			loader : 'style-loader!css-loader'
		}, {
			test : /\.(jpg|gif)$/,
			loader : 'url-loader?limit=8192'
		}, {
			test : /\.(png)$/,
			loader : 'file-loader'
		}, {
			test : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
			loader : 'file-loader'
		} ]
    },
	plugins : [
		new webpack.ProvidePlugin({
    		$ : "jquery",
    		jQuery : "jquery" }),
		new HtmlWebpackPlugin({
            template: './src/index.html',
            favicon : 'src/app/img/favicon.png'}),
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)@angular/,
            root('./src'), // location of your src
            {}),
		// workaround for warning: Critical dependency: the request of a dependency is an expression
		new webpack.ContextReplacementPlugin(
			/\@angular(\\|\/)core(\\|\/)fesm5/,
			path.resolve(__dirname, 'src')
		)
	]
}

function root(__path) {
    return path.join(__dirname, __path);
}
