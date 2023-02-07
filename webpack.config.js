const webpack = require("webpack");
const path = require("path");
const Buffer = require("buffer/").Buffer;
// const buffer = require("buffer");


const HtmlWebPackPlugin = require("html-webpack-plugin");

const htmlWebpackPlugin = new HtmlWebPackPlugin({
  template: "./src/index.html",
  filename: "./index.html"
});

// const processPlugin = new webpack.DefinePlugin({
//   'process': 'process/browser'
// });

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
  // plugins: [htmlWebpackPlugin],
<<<<<<< Updated upstream
  plugins: [htmlWebpackPlugin,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    })
  ],
  resolve: {
    extensions: ['.ts', '.js'],
=======
  plugins: [htmlWebpackPlugin, 
    
    new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
    new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
],
  resolve: {
    extensions: [ '.ts', '.js' ],
>>>>>>> Stashed changes
    fallback: {
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/")
    }
  },
  devServer: {
    historyApiFallback: true
  }
};

module.exports = config;
