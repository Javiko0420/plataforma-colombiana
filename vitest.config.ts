import path from 'node:path'
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Excluir git worktrees anidados (artefactos en .claude/worktrees) que
    // contienen copias antiguas de los tests y contaminan la suite.
    exclude: [...configDefaults.exclude, '**/.claude/**'],
  },
})


