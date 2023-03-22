const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "fs": false,
    })
    config.resolve.fallback = fallback;
    config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"]
    config.plugins = (config.plugins || []).concat([
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
    return config;
}