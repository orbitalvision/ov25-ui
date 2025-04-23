import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import { readFileSync } from 'fs';

// Read package.json manually
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default {
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/bundle/ov25-ui.js',
      format: 'umd',
      name: 'Ov25UI',
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      },
      sourcemap: true
    },
    {
      file: 'dist/bundle/ov25-ui.min.js',
      format: 'umd',
      name: 'Ov25UI',
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      },
      plugins: [terser()],
      sourcemap: true
    }
  ],
  plugins: [
    resolve({
      browser: true,
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    commonjs({
      include: /node_modules/
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        '@babel/preset-env',
        '@babel/preset-react'
      ]
    })
  ],
  // Only keep React and ReactDOM as external dependencies
  external: ['react', 'react-dom']
}; 