import {
  defineConfig,
  presetAttributify,
  presetUno,
  presetTagify,
  presetIcons,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify(),
    presetTagify(),
    presetUno(),
    presetIcons({
      scale: 1.2,
    }),
    presetWebFonts({
      fonts: {
        mono: 'Fira Code',
      },
    }),
  ],
})
