const stream = require('stream');
const debug = require('debug');
const HLS = require('hls-parser');

const Writer = require('./webdav');

const print = debug('hlx-webdav-push');

class WriteStream extends stream.Transform {
  constructor(options = {}) {
    super({objectMode: true});
    this.writer = new Writer(options);
  }

  _transform(data, _, cb) {
    let params = data;

    if (data.type === 'playlist') {
      params = {uri: data.uri, parentUri: data.parentUri, data: HLS.stringify(data)};
    }

    print(`Writing data to ${params.uri}`);

    this.writer.writeData(params)
    .then(path => {
      print(`The data is written to ${path}`);
      cb(null, data);
    })
    .catch(err => {
      console.error(err.stack);
      cb(err);
    });
  }
}

module.exports = WriteStream;
