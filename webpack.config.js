module.exports = {
		entry: './app.js',
		output: {
			path: './html-snake',
			filename: '[name].bundle.js'
		},
		devtool: 'eval-source-map',
		module: {
				loaders: [
						{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
				]
		}
}