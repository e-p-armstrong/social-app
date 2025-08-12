const createExpoWebpackConfigAsync = require('@expo/webpack-config')
const {withAlias} = require('@expo/webpack-config/addons')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const {sentryWebpackPlugin} = require('@sentry/webpack-plugin')
const webpack = require('webpack')
const {version} = require('./package.json')

const GENERATE_STATS = process.env.EXPO_PUBLIC_GENERATE_STATS === '1'
const OPEN_ANALYZER = process.env.EXPO_PUBLIC_OPEN_ANALYZER === '1'

const reactNativeWebWebviewConfiguration = {
  test: /postMock.html$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
    },
  },
}

module.exports = async function (env, argv) {
  let config = await createExpoWebpackConfigAsync(env, argv)
  config = withAlias(config, {
    'react-native$': 'react-native-web',
    'react-native-webview': 'react-native-web-webview',
    stream: 'stream-browserify',
    buffer: 'buffer',
    crypto: 'crypto-browserify',
    vm: 'empty', // vm module is Node.js specific and not needed in browser
    // Fix for @mozzius/expo-dynamic-app-icon web support
    '@mozzius/expo-dynamic-app-icon$':
      '@mozzius/expo-dynamic-app-icon/build/index.web.js',
  })
  config.module.rules = [
    ...(config.module.rules || []),
    reactNativeWebWebviewConfiguration,
  ]

  // Add support for .cjs files
  config.module.rules.push({
    test: /\.cjs$/,
    type: 'javascript/auto',
    use: {
      loader: 'babel-loader',
      options: {
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      },
    },
  })

  if (env.mode === 'development') {
    config.plugins.push(new ReactRefreshWebpackPlugin())
  } else {
    // Support static CDN for chunks
    config.output.publicPath = 'auto'
  }

  if (GENERATE_STATS || OPEN_ANALYZER) {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        openAnalyzer: OPEN_ANALYZER,
        generateStatsFile: true,
        statsFilename: '../stats.json',
        analyzerMode: OPEN_ANALYZER ? 'server' : 'json',
        defaultSizes: 'parsed',
      }),
    )
  }
  if (process.env.SENTRY_AUTH_TOKEN) {
    config.plugins.push(
      sentryWebpackPlugin({
        org: 'blueskyweb',
        project: 'app',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: {
          // env is undefined for Render.com builds, fall back
          name: process.env.SENTRY_RELEASE || version,
          dist: process.env.SENTRY_DIST,
        },
      }),
    )
  }

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ]

  return config
}
