module.exports = {  
  reporters: [['../dist/index.js', {useHttp: true, exporter: {compression: 'none'}}]],
};
