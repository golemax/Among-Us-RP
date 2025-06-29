const path = require('path');

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, './src'),
    entry: [
        "./js/load.js"
    ],
    output: {
        path: path.resolve(__dirname, './build'),
        filename: "[name].js",
        clean: true,
    },
    devtool: "inline-source-map",
}