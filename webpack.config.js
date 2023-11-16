const path = require('path');

module.exports = {
  entry: './src/ui.js',
  output: {
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'public/dist'),
    publicPath: '/dist/',
    filename: 'ui.min.js',
  },
  externals: {
    // Stubs out `import ... from 'three'` so it returns `import ... from window.THREE` effectively using THREE global variable that is defined by AFRAME.
    three: 'THREE',
  },
  devtool: 'source-map',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['solid'],
            env: {
              development: {
                plugins: [['solid-refresh/babel', { bundler: 'webpack5' }]],
              },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  devServer: {
    // port: process.env.PORT || 5000,
    liveReload: false,
    hot: true,
    watchFiles: ['src/**'],
    //    server: {
    //      type: 'https'
    //    },
    static: ['public'],
  },
};
