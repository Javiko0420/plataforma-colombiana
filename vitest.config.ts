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
    // vitest.hermetic.setup.ts first: strips credentials and blocks network.
    setupFiles: ['./vitest.hermetic.setup.ts', './vitest.setup.ts'],
    // Excluir git worktrees anidados (artefactos en .claude/worktrees) que
    // contienen copias antiguas de los tests y contaminan la suite.
    exclude: [...configDefaults.exclude, '**/.claude/**'],
  },
})


