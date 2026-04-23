import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';
import path from 'path';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [path.resolve(__dirname, 'src/shared/lib/tests/setupTests.ts')],
      include: ['**/*.test.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'test/**', '.git', '.cache'],
      root: path.resolve(__dirname, 'src'),
    },
  }),
);
