const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');  // Add this line

module.exports = {
  mode: 'production',  // You can set 'production' for production builds
  entry: {
    studyPage: './src/modules/studyPage/index.ts',
    seriePage: './src/modules/seriePage/index.ts'
  },
  output: {
    filename: '[name].js',
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
      {
        test: /\.js$/,
        include: /node_modules\/@cornerstonejs/, // Specifically transpile cornerstonejs if needed
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
  experiments: {
    asyncWebAssembly: true,  // Enable async WebAssembly support
  },
  plugins: [
    // Page 1 HTML
    new HtmlWebpackPlugin({
      filename: 'index.html', // This will be the default page
      template: './src/modules/studyPage/index.html',
      chunks: ['studyPage'],  // Only include Page 1's JS file
    }),
    // Page 2 HTML
    new HtmlWebpackPlugin({
      filename: 'seriePage/index.html',  // Output for Page 2
      template: './src/modules/seriePage/index.html',
      chunks: ['seriePage'],  // Only include Page 2's JS file
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets', to: './assets' }, // Copy the whole 'assets' folder to 'dist/assets'
      ],
    }),
  ],
  stats: 'none', // Suppresses all warnings and only shows critical errors in the console
  devServer: {
    hot: true,
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
    open: true, // Automatically open the browser when the server starts
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    },
    client: {
      overlay: false,  // Disable error overlays in the browser
    },
  },
};