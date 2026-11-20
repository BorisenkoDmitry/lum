import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default {
  distDir: process.env.DENTAL_BUILD_DIR || '.next',
  poweredByHeader: false,
  ...(process.env.LUM_STANDALONE === '1' ? { output: 'standalone' } : {}),
  devIndicators: false,
  turbopack: { root: projectRoot },
};
