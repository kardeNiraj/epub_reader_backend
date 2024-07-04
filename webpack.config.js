import Dotenv from "dotenv-webpack"
import { resolve } from "path"
import webpackNodeExternals from "webpack-node-externals"

export default {
	entry: "./index.js",
	target: "node",
	mode: "development",
	externals: [webpackNodeExternals()],
	output: {
		filename: "index.js",
		path: resolve(process.cwd(), "dist"),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"],
					},
				},
			},
		],
	},
	plugins: [
		new Dotenv({
			path: "./.env",
		}),
	],
}
