const webpack = require("webpack");

const HtmlWebPackPlugin = require("html-webpack-plugin");

const htmlWebpackPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html"
});

const config = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: "babel-loader",
        options: { presets: ['stage-2'] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ],
    loaders: [
      { test: /\.styl$/, loader: "style-loader!css-loader!stylus-loader" }
    ]
  },
  plugins: [htmlWebpackPlugin],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    historyApiFallback: true
  }
};

module.exports = config;
