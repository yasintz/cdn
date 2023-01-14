const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const fs = require('fs');
const path = require('path');
const { Base64 } = require('js-base64');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');

module.exports = {
  entry: {
    game: './src/game.ts',
    write: './src/write.ts',
  },
  mode: 'production',
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'build'),
  },

  plugins: [
    new ExtraWatchWebpackPlugin({
      files: ['static/**/*.*'],
    }),
    new WebpackShellPluginNext({
      onDoneWatch: {
        scripts: [() => merge()],
        blocking: false,
        parallel: false,
      },
    }),
  ],
};

function merge() {
  setTimeout(() => {
    merger({
      inputPath: path.join(__dirname, 'static/write.html'),
      outputPath: path.join(__dirname, '../dist/wordle/write.html'),
      replacer: [
        {
          key: '<script src="../build/write.js"></script>',
          path: 'build/write.js',
          tag: 'script',
        },
      ],
    });

    merger({
      inputPath: path.join(__dirname, 'static/game.html'),
      outputPath: path.join(__dirname, '../dist/wordle/game.html'),
      replacer: [
        {
          key: '<script src="../build/game.js"></script>',
          path: 'build/game.js',
          tag: 'script',
        },
        {
          key: '<link rel="stylesheet" href="./style.css" />',
          path: 'static/style.css',
          tag: 'style',
        },
        {
          key: '<script src="./js.js"></script>',
          path: 'static/js.js',
          tag: 'script',
        },
        {
          key: '<script src="./main.4.js"></script>',
          path: 'static/main.4.js',
          tag: 'script',
        },
        {
          key: '{{GAME_STYLE}}',
          path: 'static/game.css',
          tag: 'raw',
          handle: (content) => content.split('\n').join(' '),
        },
      ].map((i) => ({ ...i, path: path.join(__dirname, i.path) })),
    });
    fs.unlinkSync(path.join(__dirname, 'build/write.js'));
    fs.unlinkSync(path.join(__dirname, 'build/game.js'));
  }, 500);
}

function merger({ inputPath, outputPath, replacer }) {
  let htmlContent = fs.readFileSync(inputPath, 'utf-8');

  replacer.forEach((r) => {
    const handler = r.handle || ((s) => s);
    const rawContent = fs.readFileSync(r.path, 'utf-8');

    htmlContent = htmlContent
      .split(r.key)
      .join(
        [
          r.tag === 'raw' ? '' : `<${r.tag}>\n`,
          handler(rawContent),
          r.tag === 'raw' ? '' : `\n</${r.tag}>`,
        ].join('')
      );
  });

  if (outputPath) {
    fs.writeFileSync(outputPath, htmlContent);
  }
  return Base64.encode(htmlContent);
}
