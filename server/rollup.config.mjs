import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

export default defineConfig({
  input: 'src/main.ts',
  output: {
    name: 'main',
    file: '../app/main.js',
    format: 'cjs',
  },
  plugins: [
    typescript(),
    // resolve(), // so Rollup can find `ms`
    // commonjs(), // so Rollup can convert `ms` to an ES module
  ],
  external: [
    'webapp',
    'iosched',
    'middleware',
    'async/advnwc',
    'async/permission',
    'events',
    'mediadecoder',
    '@edgeros/jsre-onvif',
  ],

})
