const {defineConfig} = require('vitest/config');

module.exports = defineConfig({
  test: {
    reporters: [['@allegoria/vitest-reporter', {apiKey: 'your_allegoria_api_key'}]],
  },
});
