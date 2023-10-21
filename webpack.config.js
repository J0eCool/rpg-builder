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
                exclude: /node_modules/,
                use: [{
                    loader: "ts-loader",
                    options: {
                        configFile: "tsconfig.json"
                    }
                }]
            },
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "public"),
    },
}
