import { defineConfig } from 'unocss'

export default defineConfig({
  cli: {
    entry: {
			patterns: ['src/components/**/*.tsx'],
			outFile: './public/static/uno.css',
		},
  },
  // ...
})
