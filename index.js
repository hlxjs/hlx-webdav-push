const WriteStream = require('./writable');

function createWriteStream(options = {}) {
  return new WriteStream(options);
}

module.exports = {createWriteStream};
// es2015 default export compatibility
module.exports.default = module.exports;
