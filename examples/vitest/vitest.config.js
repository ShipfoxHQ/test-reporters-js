const {defineConfig} = require('vitest/config');

module.exports = defineConfig({  
  test: {
    reporters: ['@allegoria/vitest-reporter'],
  },
});
