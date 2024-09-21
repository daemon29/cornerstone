const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');  // Add this line

module.exports = {
  mode: 'development',  // You can set 'production' for production builds
  entry: './src/index.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean the output directory before emitting new files
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.wasm$/,
        loader: 'file-loader', // Use url-loader for WebAssembly files
        type: 'javascript/auto', // Disable default WebAssembly handling
      },
      {
        test: /\.css$/,  // Add this rule to handle CSS files
        use: ['style-loader', 'css-loader'],  // Injects CSS into the DOM and resolves imports
      },
    ],
  },
  experiments: {
    asyncWebAssembly: true,  // Enable async WebAssembly support
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Point this to your index.html file
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets', to: './assets' }, // Copy the whole 'assets' folder to 'dist/assets'
      ],
    }),
  ],
  devServer: {
    hot: true,
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
    open: true, // Automatically open the browser when the server starts
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  },
};