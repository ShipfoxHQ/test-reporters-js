module.exports = {
  reporters: [
    ['../dist/index.js', {apiKey: 'testApiKey', useHttp: true, exporter: {compression: 'none'}}],
  ],
};
