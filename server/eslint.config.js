// eslint.config.js
import {
  combine,
  comments,
  ignores,
  imports,
  javascript,
  jsdoc,
  jsonc,
  markdown,
  node,
  sortPackageJson,
  sortTsconfig,
  stylistic,
  toml,
  typescript,
  unicorn,
  vue,
  yaml,
} from '@antfu/eslint-config'

export default combine(
  typescript(/* Options */),
  comments(),
  node(),
  jsdoc(),
  imports(),
  stylistic(),
)
