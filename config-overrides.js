const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        // "path": require.resolve("path-browserify"),
        // "crypto": require.resolve("crypto-browserify"),
        // "stream": require.resolve("stream-browserify"),
        // "assert": require.resolve("assert"),
        // "http": require.resolve("stream-http"),
        // "https": require.resolve("https-browserify"),
        // "os": require.resolve("os-browserify"),
        // "url": require.resolve("url"),
        // "process": require.resolve("process"),
        "fs": false,
        // "fs": require.resolve('browserify-fs'),
        // "buffer": require.resolve("buffer/"),
        // "process": require.resolve('process/browser'),  // <- this

    })
    config.resolve.fallback = fallback;
    config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
    config.plugins = (config.plugins || []).concat([
        // new webpack.ProvidePlugin({
        //     process: 'process/browser',
        //     // Buffer: ['buffer', 'Buffer']
        // }),
        // new webpack.ProvidePlugin({
        //     // process: 'process/browser',
        //     Buffer: ['buffer', 'Buffer']
        // })

        new NodePolyfillPlugin({
            excludeAliases: ['console']
        })

    ])
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    })
    console.log(config.resolve);
    console.log(config.plugins);
    // return;
    return config;
}