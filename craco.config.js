const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const flexbugsFixes = require('postcss-flexbugs-fixes');
const postcssPresentEnv = require('postcss-preset-env');

module.exports = {
  style: {
    postcss: {
      loaderOptions: {
        postcssOptions: {
          ident: 'postcss',
          plugins: [
            flexbugsFixes,
            tailwindcss,
            postcssPresentEnv({
              autoprefixer: {
                flexbox: 'no-2009'
              },
              stage: 3,
              features: {
                'custom-properties': false
              }
            }),
            autoprefixer
          ]
        }
      }
    }
  },
  webpack: {
    configure: (webpackConfig) => {
      // Ensure Webpack 5 compatibility
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        process: require.resolve('process/browser'),
        zlib: require.resolve('browserify-zlib'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer'),
        asset: require.resolve('assert')
      };
      return webpackConfig;
    }
  }
};
