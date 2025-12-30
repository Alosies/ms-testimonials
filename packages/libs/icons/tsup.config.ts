import { defineConfig } from 'tsup'
import Vue from 'unplugin-vue/esbuild'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // Manual declarations
  clean: true,
  external: ['vue'],
  esbuildPlugins: [
    Vue({
      isProduction: true,
    }),
  ],
})
