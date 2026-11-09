import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
  },
  test: {
    environment: 'node',
    globals: true,
  },
  fmt: {
    singleQuote: true,
    semi: false,
    ignorePatterns: ['dist/**', 'node_modules/**'],
  },
  lint: {
    ignorePatterns: ['dist/**', 'node_modules/**'],
  },
})
