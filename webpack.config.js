const path = require("path")

module.exports = {
    entry: "./client/index.tsx",
    mode: "development",
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "public"),
    },
}
