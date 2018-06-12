const webpack = require('webpack');
const path = require('path');

const HtmlWebPackPlugin = require('html-webpack-plugin');

const htmlWebpackPlugin = new HtmlWebPackPlugin({
	template: "./src/index.html",
	filename: "./index.html"
})

const config = {
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
		        test: /\.css$/,
		        use: ['style-loader', 'css-loader']
		    }
		]
	},
	plugins: [htmlWebpackPlugin]
};

module.exports = config;