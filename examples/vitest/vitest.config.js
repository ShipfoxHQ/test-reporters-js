const {defineConfig} = require('vitest/config');

module.exports = defineConfig({
  test: {
    reporters: [['@shipfox/vitest-reporter', {apiKey: 'your_shipfox_api_key'}]],
  },
});
