/// <reference types="vitest" />

import path from 'node:path'
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite'

// import Pages from 'vite-plugin-pages'
import VueRouter from 'unplugin-vue-router/vite'

import { VantResolver } from 'unplugin-vue-components/resolvers'

// import mockData from 'vite-plugin-mock-data'
// import mockRoutes from './mock/routes/test'

import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
      ],
      dts: true,
      dirs: [
        './src/composables/**',
      ],
      vueTemplate: true,
      eslintrc: {
        enabled: true, // Default `false`
      },
    }),
    VueRouter({
      dts: true,
      routesFolder: 'src/pages/',
      extensions: ['.vue'],
      importMode: 'sync',
      // routesFolder: './src/pages/',
    }),
    VueMacros({
      defineOptions: false,
      defineModels: false,
      plugins: {
        vue: Vue({
          script: {
            propsDestructure: true,
            defineModel: true,
          },
        }),
      },
    }),
    Components({
      dts: true,
      resolvers: [VantResolver()],
    }),
    UnoCSS(),
  ],
  build: {
    outDir: '../app/public/',
  },
  test: {
    environment: 'jsdom',
  },
})
