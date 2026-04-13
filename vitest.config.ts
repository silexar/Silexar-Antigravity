import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Pool config Vitest 4:
    // 'threads' usa worker_threads (startup ~5x más rápido que 'forks' en Windows)
    // 'forks' usa child_process.fork — START_TIMEOUT=60s hardcodeado en Vitest 4 causa
    //   timeouts en Windows cuando el OS está bajo carga con muchos archivos en cola
    pool: 'threads',
    maxWorkers: 2,             // 2 workers paralelos — balance velocidad/estabilidad Windows
    minWorkers: 1,
    fileParallelism: true,     // archivos corren en paralelo dentro del límite
    testTimeout: 30000,        // 30s por test (algunos handlers DDD son async-heavy)
    hookTimeout: 15000,        // 15s para beforeAll/afterAll
    teardownTimeout: 10000,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/mockData/**',
        '**/__tests__/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
      ],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // UI primitives
        './src/components/ui/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        // React hooks
        './src/hooks/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        // General lib
        './src/lib/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        // Security modules — higher bar (CLAUDE.md requirement)
        './src/lib/security/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        // Auth utilities (JWT, TOTP)
        './src/lib/auth/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        // DDD domain entities — business logic must be fully tested
        './src/modules/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        './src/utils/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}', 'tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', '.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})