/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const WriteFilePlugin = require("write-file-webpack-plugin");
const { IgnorePlugin } = require("webpack");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
require('source-map-support').install();
const TerserPlugin = require('terser-webpack-plugin');

// List of NestJS lazy imports
const lazyImports = [
  '@fastify/static',
  '@fastify/view',
  '@nestjs/microservices',
  '@nestjs/microservices/microservices-module',
  '@nestjs/websockets/socket-module',
  '@nestjs/platform-express',
  'pg-native',
  'cache-manager',
  'class-validator',
  'class-transformer',
];

module.exports = () => ({
  entry: {
    lambda: './src/lambda.ts',
  },
  mode: "production",
  devtool: 'source-map',
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: 'tsconfig.webpack.json',
      }),
    ],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, "dist-lambda"),
    filename: '[name].js',
    chunkFormat: false,
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /.ts?$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: false,
              configFile: 'tsconfig.webpack.json',
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
        },
      }),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new WriteFilePlugin(),
    new IgnorePlugin({
      checkResource(resource) {
        if (lazyImports.includes(resource)) {
          try {
            require.resolve(resource);
          } catch (err) {
            return true;
          }
        }
        return false;
      },
    }),
  ],
  ignoreWarnings: [
    {
      module: /typeorm/,
      message: /Module not found|dependency is an expression/,
    }
  ]
});
