module.exports = {
		entry: './app.js',
		output: {
			path: './bin',
			filename: '[name].bundle.js'
		},
		devtool: 'eval-source-map',
		module: {
				loaders: [
						{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
				]
		}
}