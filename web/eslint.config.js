import antfu from '@antfu/eslint-config'
import unocss from '@unocss/eslint-config/flat'

import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu(
  {
    vue: true,
    typescript: true,
  },
  unocss,
  ...compat.config({
    extends: ['./.eslintrc-auto-import.json'],
  }),
)
