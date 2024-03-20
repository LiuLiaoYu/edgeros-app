import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'

export default defineConfig({
  input: {
    'main': 'src/main.ts',
    'lib/hand-detect': 'src/lib/media/hand-detect.ts',
  },
  output: {
    name: 'main',
    format: 'cjs',
    entryFileNames: '[name].js',
    dir: '../app/',
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
    'socket.io',
    'url',
    'webmedia',
    'websocket',
    'handnn',
    'lightkv',
    'async/device',
  ],

})
