require('dotenv').config();
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const withTM = require('next-transpile-modules');

module.exports =
  withTM({
    transpileModules: ['@fidm'],
    webpack: (config, options) => {
     /* config.module.rules.push({
        test: /\.mjs$/,
        type: 'javascript/auto',
      });*/
      if (options.isServer && process.env.NODE_ENV !== 'production') {
        config.plugins.push(new ForkTsCheckerWebpackPlugin());
      }
      if (!config.node) {
        config.node = {};
      }
      // Following two lines are needed because apollo13-validations library uses fs and net libraries
      config.node.fs = 'empty';
      config.node.net = 'empty';
      return config;
    },
  });

