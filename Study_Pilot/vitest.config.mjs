import { defineConfig } from 'vitest/config';

// Testi, kas lieto PostgreSQL (tests/*-db.test.js u.c.), dalās ar vienu datubāzi, tāpēc faili tiek palaisti pa vienam.
// Bez DATABASE_URL (vai .env.local) šie testi tiek izlaisti; tīrie testi (bez DB) strādā vienmēr.
export default defineConfig({
  test: {
    fileParallelism: false,
    setupFiles: ['tests/helpers/setup-env.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
