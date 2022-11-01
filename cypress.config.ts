import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    videoUploadOnPasses: false,
    setupNodeEvents(on, config) {},
  },
});
