import { defineConfig } from 'unocss'
import { presetUno } from 'unocss'
import { presetDaisy } from '@unscatty/unocss-preset-daisy'

export default defineConfig({
  cli: {
    entry: {
			patterns: ['src/components/**/*.tsx'],
			outFile: './public/static/uno.css',
		},
  },
	presets: [presetUno(), presetDaisy()],
})
