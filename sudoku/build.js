require('esbuild').buildSync({
  entryPoints: ['sudoku/index.tsx'],
  bundle: true,
  format: 'cjs',
  sourcemap: true,
  outfile: 'build/sudoku.js',
  external: [
    'require',
    'fs',
    'path',
    'os',
    'util',
    'react',
    'react-dom',
    'classnames',
    'node-sass',
  ],
  // external: ['react', 'react-dom'],
});

require('../build/sudoku.js');
