const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: "./src/basic/index.ts",
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'client'),
    filename: "[name]-bundle.js",
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: '*.html',
          context: path.resolve(__dirname, 'src', 'basic')
        },
        {
          from: path.resolve(__dirname, 'src/basic/static'),
          to: path.resolve(__dirname, 'dist/client/static'),
        },
      ],
    }),
  ],
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({ configFile: "./src/basic/tsconfig.json" })
    ],
    // Add ".ts" and ".tsx" as resolvable extensions.
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { 
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  }
};